package com.mentalhealth.journal.service;

import com.mentalhealth.journal.dto.AuthRequest;
import com.mentalhealth.journal.dto.AuthResponse;
import com.mentalhealth.journal.dto.RegisterRequest;
import com.mentalhealth.journal.entity.User;
import com.mentalhealth.journal.exception.BadRequestException;
import com.mentalhealth.journal.repository.UserRepository;
import com.mentalhealth.journal.security.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtUtil jwtUtil;

    @InjectMocks
    private UserService userService;

    private User sampleUser;

    @BeforeEach
    void setUp() {
        sampleUser = new User("testuser", "test@example.com", "encodedPassword", "Test User", "ROLE_USER");
        sampleUser.setId(1L);
    }

    @Test
    void register_Success() {
        RegisterRequest req = new RegisterRequest();
        req.setUsername("testuser");
        req.setEmail("test@example.com");
        req.setPassword("plainPassword");
        req.setFullName("Test User");
        req.setRole("ROLE_USER");

        when(userRepository.existsByUsername("testuser")).thenReturn(false);
        when(userRepository.existsByEmail("test@example.com")).thenReturn(false);
        when(passwordEncoder.encode("plainPassword")).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(sampleUser);
        when(jwtUtil.generateToken("testuser", "ROLE_USER")).thenReturn("mock-jwt-token");

        AuthResponse response = userService.register(req);

        assertNotNull(response);
        assertEquals("testuser", response.getUsername());
        assertEquals("mock-jwt-token", response.getToken());
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void register_DuplicateUsername_ThrowsBadRequest() {
        RegisterRequest req = new RegisterRequest();
        req.setUsername("existinguser");
        req.setEmail("unique@example.com");

        when(userRepository.existsByUsername("existinguser")).thenReturn(true);

        BadRequestException ex = assertThrows(BadRequestException.class, () -> userService.register(req));
        assertTrue(ex.getMessage().contains("already taken"));
        verify(userRepository, never()).save(any());
    }

    @Test
    void login_Success() {
        AuthRequest req = new AuthRequest();
        req.setUsernameOrEmail("testuser");
        req.setPassword("plainPassword");

        Authentication auth = mock(Authentication.class);
        when(auth.getName()).thenReturn("testuser");
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(auth);
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(sampleUser));
        when(jwtUtil.generateToken("testuser", "ROLE_USER")).thenReturn("mock-jwt-token");

        AuthResponse response = userService.login(req);

        assertNotNull(response);
        assertEquals("testuser", response.getUsername());
        assertEquals("mock-jwt-token", response.getToken());
    }
}
