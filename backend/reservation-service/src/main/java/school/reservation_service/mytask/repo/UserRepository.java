package school.reservation_service.mytask.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import school.reservation_service.myuser.domain.User;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByStudentIdAndName(String studentId, String name);
}
