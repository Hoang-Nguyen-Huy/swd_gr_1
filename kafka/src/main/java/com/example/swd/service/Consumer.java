package com.example.swd.service;

import com.example.swd.models.CryptoEvent;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
public class Consumer {
    private static final String TOPIC = "place_holder";
    private static final String GROUP_ID = "placeholder";

    @KafkaListener(topics = TOPIC, groupId = GROUP_ID)
    public void listen(ConsumerRecord<String, CryptoEvent> record) {
        System.out.println("Received record: " + record.value());
    }
}
