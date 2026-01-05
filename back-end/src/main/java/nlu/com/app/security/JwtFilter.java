package nlu.com.app.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import nlu.com.app.exception.ApplicationException;
import nlu.com.app.exception.ErrorCode;
import nlu.com.app.service.impl.JWTService;
import org.springframework.context.ApplicationContext;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
@RequiredArgsConstructor
public class JwtFilter extends OncePerRequestFilter {
    private static final List<String> PUBLIC_ENDPOINTS = List.of(
            "/api/v1/auth/register",
            "/api/v1/auth/login",
            "/api/file/upload",
            "/api/book",
            "/api/book/",
            "/api/category",
            "/api/review",
            "/api/promotion",
            "/chat-box",
            "/redeem-reward/**",
            "/api/collections/",
            "/ws"
    );
    private final JWTService jwtService;
    private final ApplicationContext context;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String path = request.getRequestURI();
        if (isPublicEndpoint(path)) {
            filterChain.doFilter(request, response);
            return;
        }

        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7).trim();

        if (token.isEmpty() || "null".equals(token) || "undefined".equals(token)) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            String username = jwtService.extractUsername(token);
            var userDetails = context
                    .getBean(UserDetailsService.class)
                    .loadUserByUsername(username);

            if (SecurityContextHolder.getContext().getAuthentication() == null
                    && jwtService.validateToken(token, userDetails)) {

                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                userDetails,
                                null,
                                userDetails.getAuthorities()
                        );

                authentication.setDetails(
                        new WebAuthenticationDetailsSource().buildDetails(request)
                );

                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        } catch (Exception e) {
            throw new ApplicationException(ErrorCode.UNAUTHENTICATED);
        }

        filterChain.doFilter(request, response);
    }


    private boolean isPublicEndpoint(String path) {
        return path.matches("^/api/collections/\\d+$")
                || path.startsWith("/api/v1/auth")
                || path.startsWith("/api/book")
                || path.startsWith("/api/category")
                || path.startsWith("/api/review")
                || path.startsWith("/api/promotion")
                || path.startsWith("/ws");
    }
}
