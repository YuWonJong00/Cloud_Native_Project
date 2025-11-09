package school.reservation_service.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import school.reservation_service.domain.User;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByStudentIdAndName(String studentId, String name);
}
