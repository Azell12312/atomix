import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ShiftSessionRepository
        extends JpaRepository<ShiftSession, Long> {
}
