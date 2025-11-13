package nlu.com.app.test_api;



import lombok.RequiredArgsConstructor;
import nlu.com.app.repository.RedeemRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.data.domain.PageRequest;

import static org.assertj.core.api.AssertionsForInterfaceTypes.assertThat;

@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@DataJpaTest
@RequiredArgsConstructor
class RedeemRepositoryTest {


    @Autowired
    private RedeemRepository redeemRepository;

    @Test
    void testFindByTitleContainingIgnoreCase() {
        // ✅ Test query trực tiếp
        var pageable = PageRequest.of(0, 10);
        var result = redeemRepository.findByTitleContainingIgnoreCase("conan", pageable);

        System.out.println("Tổng kết quả: " + result.getTotalElements());
        result.forEach(r -> System.out.println(r.getTitle()));

        // ✅ Kiểm tra có ra kết quả không
        assertThat(result.getContent()).isNotEmpty();
    }
}