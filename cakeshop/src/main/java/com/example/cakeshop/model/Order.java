package com.example.cakeshop.model;

import javax.persistence.*;
import java.util.List;

@Entity
@Table(name = "orders")
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ElementCollection
    private List<String> items; // List of item descriptions or JSON strings

    private double total;
    
    // New: Associate this order with a specific user
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    // Optional: order status (e.g., Pending, Delivered, Cancelled)
    private String status;

    // Constructors
    public Order() {
    }

    public Order(List<String> items, double total, User user, String status) {
        this.items = items;
        this.total = total;
        this.user = user;
        this.status = status;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public List<String> getItems() {
        return items;
    }

    public void setItems(List<String> items) {
        this.items = items;
    }

    public double getTotal() {
        return total;
    }

    public void setTotal(double total) {
        this.total = total;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }
    
    public String getStatus() {
      return status;
    }
    
    public void setStatus(String status) {
      this.status = status;
    }
}
