package school.reservation_service.api;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class ViewController {
    @GetMapping({"/","/login"})
    public String login(){
        return "forward:/login.html";
    }
    @GetMapping({"/facilities"})
    public String facilities() {
        return "forward:/facilities.html";
    }




}
