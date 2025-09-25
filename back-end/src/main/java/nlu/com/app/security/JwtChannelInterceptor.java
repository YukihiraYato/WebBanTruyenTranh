package nlu.com.app.security;

import lombok.RequiredArgsConstructor;
import nlu.com.app.service.impl.JWTService;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.util.Collections;

@Component
@RequiredArgsConstructor
public class JwtChannelInterceptor implements ChannelInterceptor {
    private final CustomUserDetailsService service;
    private final JWTService jwtService;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor =
                MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            // Lấy header Authorization từ STOMP
            String authHeader = accessor.getFirstNativeHeader("Authorization");

            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                String username = jwtService.extractUsername(token);
                UserDetails userDetails = service.loadUserByUsername(username);
                if (jwtService.validateToken(token,userDetails)) {
                    UsernamePasswordAuthenticationToken user =
                            new UsernamePasswordAuthenticationToken(
                                    username, null, Collections.emptyList());
                    // Gắn Authentication vào session
                    accessor.setUser(user);
                }
            }
        }
        return message;
    }
}
