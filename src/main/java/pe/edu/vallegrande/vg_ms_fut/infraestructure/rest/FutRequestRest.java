package pe.edu.vallegrande.vg_ms_fut.infraestructure.rest;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pe.edu.vallegrande.vg_ms_fut.application.service.IFutRequestService;
import pe.edu.vallegrande.vg_ms_fut.domain.model.FutRequest;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Slf4j
@RestController
@RequestMapping("/api/v1/fut")
@CrossOrigin(origins = "*")  
@RequiredArgsConstructor
public class FutRequestRest {

    private final IFutRequestService service;

    @PostMapping
    public Mono<ResponseEntity<FutRequest>> create(@RequestBody FutRequest request) {
        return service.createRequest(request)
                .map(saved -> ResponseEntity.status(HttpStatus.CREATED).body(saved));
    }

    @GetMapping("/{id}")
    public Mono<ResponseEntity<FutRequest>> getById(@PathVariable String id) {
        return service.getRequestById(id)
                .map(ResponseEntity::ok)
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    @GetMapping
    public Flux<FutRequest> getAll() {
        return service.getAllRequests();
    }

    @PutMapping("/{id}")
    public Mono<ResponseEntity<FutRequest>> update(@PathVariable String id, @RequestBody FutRequest request) {
        return service.updateRequest(id, request)
                .map(ResponseEntity::ok)
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public Mono<ResponseEntity<Void>> delete(@PathVariable String id) {
        return service.deleteRequest(id)
                .thenReturn(ResponseEntity.noContent().build());
    }

    @GetMapping("/search/subject")
    public Flux<FutRequest> searchBySubject(@RequestParam String subject) {
        return service.searchByRequestSubject(subject);
    }

    @GetMapping("/by-enrollment/student")
    public Flux<FutRequest> searchByStudent(@RequestParam String studentEnrollmentId) {
        return service.searchByStudentEnrollmentId(studentEnrollmentId);
    }
}
