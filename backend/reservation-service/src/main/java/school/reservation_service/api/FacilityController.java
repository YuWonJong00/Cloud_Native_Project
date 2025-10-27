
package school.reservation_service.api;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import school.reservation_service.api.dto.FacilityDto;

import java.util.List;
import java.util.Map;

@RestController
public class FacilityController {
    @GetMapping("/api/facilities")
    public ResponseEntity<List<FacilityDto>> list() {
        var data = List.of(
                new FacilityDto(1, "테니스장", "08:00", "22:00"),
                new FacilityDto(2, "농구장", "09:00", "21:00"),
                new FacilityDto(3, "축구장", "10:00", "20:00")
        );
        return ResponseEntity.ok(data);
    }


}

