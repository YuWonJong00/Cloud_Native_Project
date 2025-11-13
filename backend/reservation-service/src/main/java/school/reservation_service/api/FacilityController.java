
package school.reservation_service.api;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import school.reservation_service.api.dto.FacilityDto;

import java.util.List;

@RestController
public class FacilityController {
    @GetMapping("/api/facilities")
    public ResponseEntity<List<FacilityDto>> list() {
        var data = List.of(
                new FacilityDto(1, "TENNIS", "06:00", "22:00","0"),
                new FacilityDto(2, "BASKETBALL", "06:00", "22:00","0"),
                new FacilityDto(3, "SOCCER", "06:00", "22:00","0")
        );
        return ResponseEntity.ok(data);
    }


}

