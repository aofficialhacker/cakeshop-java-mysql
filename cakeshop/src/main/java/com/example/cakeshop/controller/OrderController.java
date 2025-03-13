package com.example.cakeshop.controller;

import com.example.cakeshop.model.Order;
import com.example.cakeshop.model.User;
import com.example.cakeshop.repository.OrderRepository;
import com.example.cakeshop.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "http://localhost:5500")
public class OrderController {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository; // Used to retrieve the User entity

    // Create an order (for authenticated users)
    @PostMapping
    public Order createOrder(@RequestBody Order order, Principal principal) {
        // Retrieve the currently authenticated user using the email from Principal
        User currentUser = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found: " + principal.getName()));
        // Associate the order with the current user
        order.setUser(currentUser);
        // Set default status if not provided
        if (order.getStatus() == null) {
            order.setStatus("Pending");
        }
        return orderRepository.save(order);
    }

    // Retrieve orders for the current user
    @GetMapping("/myorders")
    public List<Order> getUserOrders(Principal principal) {
        User currentUser = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found: " + principal.getName()));
        return orderRepository.findByUser(currentUser);
    }

    // Retrieve a specific order by its ID, ensuring it belongs to the current user
    @GetMapping("/{id}")
    public Order getOrderById(@PathVariable Long id, Principal principal) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + id));
        if (order.getUser().getEmail().equals(principal.getName())) {
            return order;
        }
        throw new RuntimeException("Unauthorized access to order id: " + id);
    }

    // Admin endpoint: Update a specific order's status
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/admin/{id}/status")
    public Order updateOrderStatus(@PathVariable Long id, @RequestParam String status) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + id));
        order.setStatus(status);
        return orderRepository.save(order);
    }
    
    // Admin endpoint: Update status for all orders
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/admin/status")
    public List<Order> updateAllOrdersStatus(@RequestParam String status) {
        List<Order> orders = orderRepository.findAll();
        orders.forEach(order -> order.setStatus(status));
        return orderRepository.saveAll(orders);
    }
}
