package school.reservation_service.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.resource.ResourceHttpRequestHandler;

@Component
public class LoginRequiredInterceptor implements HandlerInterceptor {
    public boolean preHandle(HttpServletRequest req, HttpServletResponse res, Object handler) throws Exception {
        if (handler instanceof ResourceHttpRequestHandler) return true;
        String uri=req.getRequestURI();
        if(uri.startsWith("/login") ||
                uri.startsWith("/auth/") ||
                uri.startsWith("/css/") ||
                uri.startsWith("/js/") ||
                uri.startsWith("/assets/") ||
                uri.startsWith("/actuator/")) {
            return true;
        }
        HttpSession session = req.getSession(false);
        if (session != null && session.getAttribute("LOGIN_USER_NAME") != null) {
            return true; // 로그인됨
        }


        //res.sendRedirect("/login");
        return false;
    }
}
