#!/usr/bin/env python3
import urllib.request
import urllib.error
import json
import time
import random
import string
import sys
import csv
import os

# Target rate: 100 requests per 30 minutes -> 1 request every 18 seconds
REQUEST_INTERVAL = 18.0 

# Fallback datasets in case CSV is missing or unreadable
FALLBACK_INPUTS = [
    {
        "username_prefix": "dt_user",
        "password": "Pass123!",
        "email_domain": "dynatrace.com",
        "journal_title": "GKE Postgres Deployment",
        "journal_content": "Verified StatefulSet and Ingress successfully.",
        "journal_title_updated": "Updated GKE Title",
        "journal_content_updated": "Updated GKE Content details."
    }
]

def load_test_inputs(file_path):
    """Loads input values from a CSV file."""
    if not os.path.exists(file_path):
        print(f"⚠️ Warning: CSV file '{file_path}' not found. Using fallback datasets.")
        return FALLBACK_INPUTS
    
    inputs = []
    try:
        with open(file_path, mode='r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                # Ensure all required keys exist
                required_keys = ["username_prefix", "password", "email_domain", "journal_title", "journal_content", "journal_title_updated", "journal_content_updated"]
                if all(k in row and row[k] for k in required_keys):
                    inputs.append(row)
                else:
                    print(f"⚠️ Warning: Skipping invalid/incomplete CSV row: {row}")
    except Exception as e:
        print(f"❌ Error reading '{file_path}': {e}. Using fallback datasets.")
    
    return inputs if inputs else FALLBACK_INPUTS

def generate_random_string(length=8):
    letters = string.ascii_lowercase + string.digits
    return ''.join(random.choice(letters) for i in range(length))

def make_request(url, method, headers=None, data=None):
    if headers is None:
        headers = {}
    req_data = None
    if data is not None:
        req_data = json.dumps(data).encode('utf-8')
        headers['Content-Type'] = 'application/json'
    
    req = urllib.request.Request(url, data=req_data, headers=headers, method=method)
    
    start_time = time.time()
    try:
        with urllib.request.urlopen(req) as response:
            status = response.status
            response_body = response.read().decode('utf-8')
            elapsed = time.time() - start_time
            return status, response_body, elapsed
    except urllib.error.HTTPError as e:
        status = e.code
        try:
            response_body = e.read().decode('utf-8')
        except Exception:
            response_body = ""
        elapsed = time.time() - start_time
        return status, response_body, elapsed
    except Exception as e:
        elapsed = time.time() - start_time
        return 0, str(e), elapsed

def log_step(step_name, method, url, status, expected_status, elapsed, body, success):
    symbol = "✅ SUCCESS" if success else "❌ FAILED"
    print("=" * 80)
    print(f"Step: {step_name}")
    print(f"Request: {method} {url}")
    print(f"Response Status: {status} (Expected: {expected_status})")
    print(f"Execution Time: {elapsed:.3f}s")
    print(f"Response Body: {body}")
    print(f"Result: {symbol}")
    print("=" * 80)
    print()

def run_request_with_delay(step_name, url, method, expected_status, headers=None, data=None, cycle=1):
    if headers is None:
        headers = {}
    
    # Inject Dynatrace tagging headers for test monitoring
    # Format: LSN=LoadTestName;TSN=TestStepName;LTN=LoopIterationTag;
    headers['X-Dynatrace-Test'] = f"LSN=JournalCSVJourney;TSN={step_name.replace(' ', '_')};LTN=Cycle_{cycle};"
    
    # Perform HTTP request
    status, body, elapsed = make_request(url, method, headers, data)
    
    # Assert status code
    success = (status == expected_status)
    log_step(step_name, method, url, status, expected_status, elapsed, body, success)
    
    # Enforce request interval to maintain rate (100 requests per 30 minutes)
    sleep_time = max(0.1, REQUEST_INTERVAL - elapsed)
    print(f"Sleeping {sleep_time:.2f} seconds to maintain rate (100 requests / 30 mins)...")
    time.sleep(sleep_time)
    
    return success, status, body

def run_user_journey(base_url, row_data, cycle=1):
    # Parameterize input variables from the loaded CSV row
    username_prefix = row_data["username_prefix"]
    password = row_data["password"]
    email_domain = row_data["email_domain"]
    journal_title = row_data["journal_title"]
    journal_content = row_data["journal_content"]
    journal_title_updated = row_data["journal_title_updated"]
    journal_content_updated = row_data["journal_content_updated"]

    # Generate a unique username based on the prefix to avoid collisions across multiple cycles
    username = f"{username_prefix}_{generate_random_string()}"
    email = f"{username}@{email_domain}"
    
    print(f"--- Running User Journey ---")
    print(f"Username: {username}")
    print(f"Journal Title: {journal_title}")
    print(f"Journal Content: {journal_content}")
    print(f"----------------------------\n")
    
    # 1. Sign Up - Success Case (Expected: 200 OK)
    signup_data = {"username": username, "password": password, "email": email}
    success, _, _ = run_request_with_delay(
        "User Registration",
        f"{base_url}/public/signup",
        "POST",
        200,
        data=signup_data,
        cycle=cycle
    )
    if not success:
        return False

    # 2. Login - Success Case (Expected: 200 OK)
    login_data = {"username": username, "password": password}
    success, status, jwt_token = run_request_with_delay(
        "User Login Success",
        f"{base_url}/public/login",
        "POST",
        200,
        data=login_data,
        cycle=cycle
    )
    if not success:
        return False
    
    auth_headers = {"Authorization": f"Bearer {jwt_token}"}
    print(f"Obtained JWT Token: {jwt_token[:20]}...\n")

    # 3. Login - Failed Case (Expected: 400 Bad Request)
    invalid_login_data = {"username": username, "password": "incorrect_password_attempt"}
    success, status, body = run_request_with_delay(
        "User Login Wrong Password",
        f"{base_url}/public/login",
        "POST",
        400,
        data=invalid_login_data,
        cycle=cycle
    )
    if "Incorrect username and password" not in body:
        print("⚠️ Warning: Proper error message not found in login failure response.")

    # 4. Duplicate Sign Up - Failed Case (Expected: 500 server error due to DB unique constraints)
    # This checks index violation scenarios in PostgreSQL
    run_request_with_delay(
        "User Registration Duplicate Name",
        f"{base_url}/public/signup",
        "POST",
        500,
        data=signup_data,
        cycle=cycle
    )

    # 5. Get Journal Entries when empty - Validation Case (Expected: 400 Bad Request)
    run_request_with_delay(
        "Get Journal Entries Empty List",
        f"{base_url}/journal",
        "GET",
        400,
        headers=auth_headers,
        cycle=cycle
    )

    # 6. Create Journal Entry - Success Case (Expected: 201 Created)
    entry_data = {"title": journal_title, "content": journal_content}
    success, status, body = run_request_with_delay(
        "Create Journal Entry Success",
        f"{base_url}/journal",
        "POST",
        201,
        headers=auth_headers,
        data=entry_data,
        cycle=cycle
    )
    if not success:
        return False
    
    try:
        created_entry = json.loads(body)
        entry_id = created_entry.get("id")
    except Exception as e:
        print(f"❌ FAILED: Could not parse response body: {e}")
        return False
    
    print(f"Created Entry ID: {entry_id}\n")

    # 7. Create Journal Entry - Failed Case (Expected: 400 Bad Request)
    # Missing title triggers Spring Boot/JPA @NonNull constraint checks
    failed_entry_data = {"content": "Missing title test case"}
    run_request_with_delay(
        "Create Journal Entry Missing Title",
        f"{base_url}/journal",
        "POST",
        400,
        headers=auth_headers,
        data=failed_entry_data,
        cycle=cycle
    )

    # 8. Get All Journal Entries - Success Case (Expected: 200 OK)
    success, _, _ = run_request_with_delay(
        "Get All Journal Entries",
        f"{base_url}/journal",
        "GET",
        200,
        headers=auth_headers,
        cycle=cycle
    )
    if not success:
        return False

    # 9. Get Single Journal Entry by ID - Success Case (Expected: 200 OK)
    success, _, _ = run_request_with_delay(
        "Get Single Journal Entry",
        f"{base_url}/journal/id/{entry_id}",
        "GET",
        200,
        headers=auth_headers,
        cycle=cycle
    )
    if not success:
        return False

    # 10. Get Single Journal Entry - Failed Case No Auth (Expected: 403 Forbidden)
    run_request_with_delay(
        "Get Single Journal Entry Unauthenticated",
        f"{base_url}/journal/id/{entry_id}",
        "GET",
        403,
        cycle=cycle
    )

    # 11. Update Journal Entry by ID - Success Case (Expected: 200 OK)
    updated_data = {"title": journal_title_updated, "content": journal_content_updated}
    success, _, _ = run_request_with_delay(
        "Update Journal Entry",
        f"{base_url}/journal/id/{entry_id}",
        "PUT",
        200,
        headers=auth_headers,
        data=updated_data,
        cycle=cycle
    )
    if not success:
        return False

    # 12. Delete Journal Entry by ID - Success Case (Expected: 204 No Content)
    success, _, _ = run_request_with_delay(
        "Delete Journal Entry",
        f"{base_url}/journal/id/{entry_id}",
        "DELETE",
        204,
        headers=auth_headers,
        cycle=cycle
    )
    if not success:
        return False

    # 13. Get Deleted Journal Entry - Failed Case (Expected: 404 Not Found)
    run_request_with_delay(
        "Get Deleted Journal Entry",
        f"{base_url}/journal/id/{entry_id}",
        "GET",
        404,
        headers=auth_headers,
        cycle=cycle
    )
    
    return True

if __name__ == "__main__":
    base_url = "http://localhost:8081"
    if len(sys.argv) > 1:
        base_url = sys.argv[1].rstrip('/')
    
    csv_file = "test_inputs.csv"
    test_inputs = load_test_inputs(csv_file)
    
    print("=" * 80)
    print(f"Starting Dynatrace-ready CSV Journal Journey Test Suite")
    print(f"Target Base URL: {base_url}")
    print(f"Loaded test scenarios from CSV: {len(test_inputs)}")
    print(f"Request Pace: 1 request every {REQUEST_INTERVAL} seconds (~100 req / 30 min)")
    print("=" * 80 + "\n")
    
    cycle = 1
    try:
        while True:
            # Pick a row from the CSV sequentially using the cycle index
            row_index = (cycle - 1) % len(test_inputs)
            current_row = test_inputs[row_index]
            
            print(f"--- Running Test Cycle {cycle} using CSV Row {row_index + 1} ---")
            journey_success = run_user_journey(base_url, current_row, cycle=cycle)
            
            if journey_success:
                print(f"--- Cycle {cycle} completed successfully! ---\n")
            else:
                print(f"--- Cycle {cycle} completed with errors. Check logs. ---\n")
            
            cycle += 1
    except KeyboardInterrupt:
        print("\nTesting terminated by user. Goodbye!")
