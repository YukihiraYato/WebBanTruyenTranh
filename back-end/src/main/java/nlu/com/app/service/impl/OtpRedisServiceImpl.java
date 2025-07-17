package nlu.com.app.service.impl;

import nlu.com.app.repository.UserRepository;
import nlu.com.app.service.OtpRedisService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.Random;
import java.util.concurrent.TimeUnit;

@Service
public class OtpRedisServiceImpl implements OtpRedisService {


    private static final long OTP_EXPIRE_MINUTES = 5;
    @Autowired
    private StringRedisTemplate redisTemplate;
    @Override
    public void saveOtp(String email, String otp) {
        redisTemplate.opsForValue().set(email, otp, OTP_EXPIRE_MINUTES, TimeUnit.MINUTES);
    }

    @Override
    public boolean isValid(String email, String inputOtp) {
        String storedOtp = redisTemplate.opsForValue().get(email);
        return storedOtp != null && storedOtp.equals(inputOtp);
    }

    @Override
    public void clearOtp(String email) {
        redisTemplate.delete(email);
    }


}
