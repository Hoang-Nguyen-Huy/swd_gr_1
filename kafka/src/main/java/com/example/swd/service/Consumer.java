package com.example.swd.service;

import com.example.swd.models.CryptoEvent;
import com.example.swd.controller.SocketController;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class Consumer {
    private static final String TOPIC = "cal_avg_crypto_currency";
    private static final String GROUP_ID = "placeholder";

    private final SocketController socketController;

    @KafkaListener(topics = TOPIC, groupId = GROUP_ID)
    public void listen(ConsumerRecord<String, String> record) {
        try {
            String json = record.value();
            ObjectMapper mapper = new ObjectMapper();
            CryptoEvent event = mapper.readValue(json, CryptoEvent.class);
            System.out.println("Deserialized event: " + event);
            // socketController.sendMessageToClients(event); // example usage
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
