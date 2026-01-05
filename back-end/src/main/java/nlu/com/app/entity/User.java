package nlu.com.app.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import nlu.com.app.constant.EUserStatus;
import nlu.com.app.constant.UserRole;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * @author VuLuu
 */
@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long userId;
    //  @Column(name = "user_role")
//  private String userRole;
    @Column(name = "username", unique = true)
    private String username;
    @Column(name = "password")
    private String password;
    @Column(name = "email", unique = true)
    private String email;
    @Column(name = "created_date")
    private LocalDate created_date;
    @Enumerated(EnumType.STRING)
    @Column(name = "role")
    private UserRole role;
    @Column(name = "verified")
    private boolean verified;
    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private EUserStatus status;
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<BookCollection> bookCollections = new ArrayList<>();
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Order> orders = new ArrayList<>();
    @OneToMany(mappedBy = "currentAdmin")
    private List<Conversation> conversations = new ArrayList<>();
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<UserSearchHistory> userSearchHistories = new ArrayList<>();
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<UserDiscountUsage> usedDiscounts = new ArrayList<>();
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Notifications> notifications = new ArrayList<>();
    @OneToOne(mappedBy = "user", fetch = FetchType.LAZY)
    private UserDetails userDetails;
}
