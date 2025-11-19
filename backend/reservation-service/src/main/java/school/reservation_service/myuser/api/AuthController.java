package school.reservation_service.myuser.api;

import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import school.reservation_service.mytask.api.dto.UserInfoResponse;
import school.reservation_service.myuser.domain.User;
import school.reservation_service.mytask.repo.UserRepository;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final UserRepository userRepository;

    public AuthController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/check")
    public ResponseEntity<UserInfoResponse> checkSession(HttpSession session) {
        String name = (String) session.getAttribute("LOGIN_USER_NAME");

        // 1. 세션에 저장된 타입(Long)으로 값을 가져옵니다.
        Long studentId= (Long) session.getAttribute("LOGIN_USER_ID");

        if (name == null || studentId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        // 2. UserInfoResponse가 String을 요구한다면 Long을 String으로 변환합니다.
        // 이미 로그인 되어있는 상태
        UserInfoResponse dto = new UserInfoResponse(name, studentId);
        return ResponseEntity.ok(dto);
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
