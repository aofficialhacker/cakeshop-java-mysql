package com.example.cakeshop.controller;

import com.example.cakeshop.model.Cake;
import com.example.cakeshop.service.CakeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cakes")
@CrossOrigin(origins = "http://localhost:5500") // Adjust this based on your frontend server
public class CakeController {

    @Autowired
    private CakeService cakeService;

    @GetMapping
    public List<Cake> getCakes() {
        return cakeService.getAllCakes();
    }

    @PostMapping
    public Cake createCake(@RequestHeader("X-User-Role") String role, @RequestBody Cake cake) {
        if (!"ADMIN".equals(role)) {
            throw new RuntimeException("Unauthorized: Only admin can add cakes");
        }
        return cakeService.saveCake(cake);
    }

    @GetMapping("/{id}")
    public Cake getCake(@PathVariable Long id) {
        return cakeService.getCakeById(id).orElse(null);
    }

    @PutMapping("/{id}")
    public Cake updateCake(@RequestHeader("X-User-Role") String role, @PathVariable Long id,
            @RequestBody Cake cakeDetails) {
        if (!"ADMIN".equals(role)) {
            throw new RuntimeException("Unauthorized: Only admin can update cakes");
        }
        Cake cake = cakeService.getCakeById(id).orElse(null);
        if (cake != null) {
            cake.setName(cakeDetails.getName());
            cake.setDescription(cakeDetails.getDescription());
            cake.setPrice(cakeDetails.getPrice());
            cake.setPhotoUrl(cakeDetails.getPhotoUrl());
            return cakeService.saveCake(cake);
        }
        return null;
    }

    @DeleteMapping("/{id}")
    public void deleteCake(@RequestHeader("X-User-Role") String role, @PathVariable Long id) {
        if (!"ADMIN".equals(role)) {
            throw new RuntimeException("Unauthorized: Only admin can delete cakes");
        }
        cakeService.deleteCake(id);
    }
}
