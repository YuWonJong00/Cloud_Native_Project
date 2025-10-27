package school.reservation_service.api;

import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;


@Controller
@RequestMapping("/auth")

public class AuthController {
    @PostMapping("/login")
    public String login(
            @RequestParam String name,
            @RequestParam String studentId,
            HttpSession session
    ){
        // TODO: 실제로는 DB 조회/검증 로직 넣기
        if (name == null || name.isBlank() || studentId == null || studentId.isBlank()) {
            return "redirect:/login?error=1";
        }
        // 데모 검증(예: 학번이 숫자 9자리 이상이면 통과)
        if (!studentId.matches("\\d{9,}")) {
            return "redirect:/login?error=too_short";
        }
        session.setAttribute("LOGIN_USER_NAME", name);
        session.setAttribute("LOGIN_USER_ID", studentId);
        return "redirect:/facilities";
    }
    @GetMapping("/logout")
    public String logout(HttpSession session) {
        session.invalidate();
        return "redirect:/login";
    }
}

