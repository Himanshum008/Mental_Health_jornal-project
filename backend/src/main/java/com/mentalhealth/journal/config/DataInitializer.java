package com.mentalhealth.journal.config;

import com.mentalhealth.journal.entity.JournalEntry;
import com.mentalhealth.journal.entity.MoodAnalysis;
import com.mentalhealth.journal.entity.User;
import com.mentalhealth.journal.repository.JournalEntryRepository;
import com.mentalhealth.journal.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final JournalEntryRepository journalRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(
            UserRepository userRepository,
            JournalEntryRepository journalRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.journalRepository = journalRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (userRepository.count() == 0) {
            log.info("Initializing starter users and demonstration journal entries...");

            // Create Admin
            User admin = new User(
                    "admin",
                    "admin@mentalhealth.org",
                    passwordEncoder.encode("admin123"),
                    "System Administrator & ML Trainer",
                    "ROLE_ADMIN"
            );
            userRepository.save(admin);

            // Create Regular User
            User user = new User(
                    "user",
                    "user@journal.com",
                    passwordEncoder.encode("user123"),
                    "Alex Morgan",
                    "ROLE_USER"
            );
            user = userRepository.save(user);

            // Add demo journal entries across consecutive days
            createEntry(user, "A Breath of Fresh Air in the Park",
                    "Went for a long morning walk around the botanical garden. The sun was warm, birds were singing, and for the first time in weeks, my mind felt clear and completely unburdened.",
                    "Joy", "walk, nature, peace", LocalDate.now().minusDays(3),
                    "Joy", "POSITIVE", 0.92,
                    "{\"Joy\":0.92,\"Calm\":0.06,\"Neutral\":0.02}",
                    "What specific moment brought you the most joy today?");

            createEntry(user, "Exams and Impending Deadlines",
                    "Feeling quite anxious about tomorrow's presentation. Heart is racing whenever I think about public speaking. Tried deep breathing but still feeling somewhat on edge.",
                    "Anxiety", "college, exams, stress", LocalDate.now().minusDays(2),
                    "Anxiety", "NEGATIVE", 0.88,
                    "{\"Anxiety\":0.88,\"Fear\":0.08,\"Sadness\":0.04}",
                    "Try grounding yourself: name 3 things you can see and 3 things you can feel around you.");

            createEntry(user, "Slow Evening and Quiet Reflection",
                    "Brewed a cup of herbal chamomile tea and listened to gentle lo-fi music while writing. Managed to finish my tasks for the day and let go of yesterday's stress.",
                    "Calm", "tea, relaxation, night", LocalDate.now().minusDays(1),
                    "Calm", "POSITIVE", 0.89,
                    "{\"Calm\":0.89,\"Joy\":0.08,\"Neutral\":0.03}",
                    "What helped you find peace and balance today?");

            createEntry(user, "New Beginning & Fresh Goals",
                    "Started setting new weekly wellness habits. Feeling motivated, grateful for supportive friends, and excited to see what the future brings!",
                    "Joy", "gratitude, motivation, future", LocalDate.now(),
                    "Joy", "POSITIVE", 0.95,
                    "{\"Joy\":0.95,\"Calm\":0.03,\"Neutral\":0.02}",
                    "How can you carry this positive energy into tomorrow?");

            log.info("Initialized demo users (admin / user) and sample journal entries.");
        }
    }

    private void createEntry(
            User user, String title, String content, String userMood, String tags,
            LocalDate date, String predMood, String sentiment, double conf,
            String scoresJson, String reflection
    ) {
        JournalEntry entry = new JournalEntry();
        entry.setUser(user);
        entry.setTitle(title);
        entry.setContent(content);
        entry.setUserSelectedMood(userMood);
        entry.setTags(tags);
        entry.setEntryDate(date);

        MoodAnalysis analysis = new MoodAnalysis();
        analysis.setPredictedMood(predMood);
        analysis.setSentiment(sentiment);
        analysis.setConfidenceScore(conf);
        analysis.setEmotionScoresJson(scoresJson);
        analysis.setModelVersionUsed("v1.0");
        analysis.setAiReflectionInsight(reflection);

        entry.setMoodAnalysis(analysis);
        journalRepository.save(entry);
    }
}
