package com.example.cakeshop.service;

import com.example.cakeshop.model.Cake;
import com.example.cakeshop.repository.CakeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CakeService {

    @Autowired
    private CakeRepository cakeRepository;

    public List<Cake> getAllCakes() {
        return cakeRepository.findAll();
    }

    public Optional<Cake> getCakeById(Long id) {
        return cakeRepository.findById(id);
    }

    public Cake saveCake(Cake cake) {
        return cakeRepository.save(cake);
    }

    public void deleteCake(Long id) {
        cakeRepository.deleteById(id);
    }
}
