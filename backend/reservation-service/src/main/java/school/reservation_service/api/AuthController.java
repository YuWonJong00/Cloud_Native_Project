package school.reservation_service.api;

import jakarta.servlet.http.HttpSession;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import school.reservation_service.domain.User;
import school.reservation_service.repo.UserRepository;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final UserRepository userRepository;

    public AuthController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @PostMapping("/login")
    public ResponseEntity<Void> login(
                                       @RequestParam String name,
                                       @RequestParam String studentId,
                                       HttpSession session
    ){
        Optional<User> userOptional = userRepository.findByStudentIdAndName(studentId, name);

       if(userOptional.isPresent()) {
           User user = userOptional.get();
           Long userId = Long.valueOf(user.getStudentId());
           session.setAttribute("LOGIN_USER_NAME", user.getName());
           session.setAttribute("LOGIN_USER_ID", userId);

           // 200 OK (본문 없음) 반환
           return ResponseEntity.ok().build();
       } else {
           // 4. 로그인 실패: 사용자를 찾을 수 없음
           // 401 Unauthorized (인증 실패) 반환
           return ResponseEntity.status(401).build();

       }
    }

    @GetMapping("/logout")
    public ResponseEntity<Void> logout(HttpSession session) {
        session.invalidate();
        return ResponseEntity.ok().build(); // 로그아웃 성공 시 200 OK
    }
}
