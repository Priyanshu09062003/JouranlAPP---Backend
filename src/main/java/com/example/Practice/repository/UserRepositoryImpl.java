package com.example.Practice.repository;

import com.example.Practice.entities.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;

import java.util.List;

public class UserRepositoryImpl {
//    public

    @Autowired
    MongoTemplate mongoTemplate;

    public List<User> getUserForSA()
    {
        Query query = new Query();
//        query.addCriteria(Criteria.where("username").is("ram"));
//        List<User> users = mongoTemplate.find(query, User.class);
//        return users;

        query.addCriteria(Criteria.where("email").exists(true));
        query.addCriteria(Criteria.where("email").ne(null).ne(""));
        query.addCriteria(Criteria.where("sentimentAnalysis").is(true));

//        Criteria criteria = new Criteria();
//        query.addCriteria(criteria.orOperator(Criteria.where("email").exists(true),Criteria.where("sentimentAnalysis").is(true)));

        List<User> users = mongoTemplate.find(query, User.class);
        return users;
    }
}
