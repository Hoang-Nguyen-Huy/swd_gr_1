package com.example.swd.controller;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class SocketController {
    private final SimpMessagingTemplate messagingTemplate;

    public void sendCryptoEvent(Object event) {
        messagingTemplate.convertAndSend("/topic/crypto", event);
    }
}
