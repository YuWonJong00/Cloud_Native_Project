package school.reservation_service.domain;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name="User")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // DB의 PK (Long 타입)

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, unique = true, length = 20)
    private String studentId; // DB의 student_id (로그인 ID)
}
