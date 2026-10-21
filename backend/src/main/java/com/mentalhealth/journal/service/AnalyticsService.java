package com.mentalhealth.journal.service;

import com.mentalhealth.journal.dto.AnalyticsSummaryDTO;
import com.mentalhealth.journal.entity.JournalEntry;
import com.mentalhealth.journal.entity.User;
import com.mentalhealth.journal.repository.JournalEntryRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    private final JournalEntryRepository journalRepository;

    public AnalyticsService(JournalEntryRepository journalRepository) {
        this.journalRepository = journalRepository;
    }

    public AnalyticsSummaryDTO getSummary(User user) {
        List<JournalEntry> entries = journalRepository.findByUserIdOrderByEntryDateDesc(user.getId());
        AnalyticsSummaryDTO dto = new AnalyticsSummaryDTO();
        dto.setTotalEntries(entries.size());

        if (entries.isEmpty()) {
            dto.setCurrentStreakDays(0);
            dto.setDominantMood("None");
            dto.setAverageConfidence(0.0);
            dto.setPositiveCount(0);
            dto.setNeutralCount(0);
            dto.setNegativeCount(0);
            dto.setMoodDistribution(Collections.emptyMap());
            return dto;
        }

        // Calculate Streak
        int streak = calculateStreak(entries);
        dto.setCurrentStreakDays(streak);

        // Calculate Sentiment Counts & Mood Distribution
        long pos = 0, neu = 0, neg = 0;
        double sumConfidence = 0;
        int confCount = 0;
        Map<String, Long> moodCounts = new HashMap<>();

        for (JournalEntry entry : entries) {
            if (entry.getMoodAnalysis() != null) {
                String mood = entry.getMoodAnalysis().getPredictedMood();
                moodCounts.put(mood, moodCounts.getOrDefault(mood, 0L) + 1);

                String sentiment = entry.getMoodAnalysis().getSentiment();
                if ("POSITIVE".equalsIgnoreCase(sentiment)) pos++;
                else if ("NEGATIVE".equalsIgnoreCase(sentiment)) neg++;
                else neu++;

                if (entry.getMoodAnalysis().getConfidenceScore() != null) {
                    sumConfidence += entry.getMoodAnalysis().getConfidenceScore();
                    confCount++;
                }
            }
        }

        dto.setPositiveCount(pos);
        dto.setNeutralCount(neu);
        dto.setNegativeCount(neg);
        dto.setMoodDistribution(moodCounts);
        dto.setAverageConfidence(confCount > 0 ? Math.round((sumConfidence / confCount) * 1000.0) / 1000.0 : 0.0);

        String dominant = moodCounts.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("Neutral");
        dto.setDominantMood(dominant);

        return dto;
    }

    public List<Map<String, Object>> getMoodTrends(User user, LocalDate startDate, LocalDate endDate) {
        LocalDate start = (startDate != null) ? startDate : LocalDate.now().minusDays(30);
        LocalDate end = (endDate != null) ? endDate : LocalDate.now();

        List<JournalEntry> entries = journalRepository.findByUserIdAndEntryDateBetweenOrderByEntryDateAsc(user.getId(), start, end);

        Map<LocalDate, List<JournalEntry>> byDate = entries.stream()
                .collect(Collectors.groupingBy(JournalEntry::getEntryDate, LinkedHashMap::new, Collectors.toList()));

        List<Map<String, Object>> trendList = new ArrayList<>();
        for (Map.Entry<LocalDate, List<JournalEntry>> entry : byDate.entrySet()) {
            LocalDate date = entry.getKey();
            List<JournalEntry> dayEntries = entry.getValue();

            double totalScore = 0;
            int count = 0;
            Map<String, Integer> dayMoods = new HashMap<>();

            for (JournalEntry je : dayEntries) {
                if (je.getMoodAnalysis() != null) {
                    String sent = je.getMoodAnalysis().getSentiment();
                    if ("POSITIVE".equalsIgnoreCase(sent)) totalScore += 1.0;
                    else if ("NEGATIVE".equalsIgnoreCase(sent)) totalScore += -1.0;
                    else totalScore += 0.0;
                    count++;

                    String mood = je.getMoodAnalysis().getPredictedMood();
                    dayMoods.put(mood, dayMoods.getOrDefault(mood, 0) + 1);
                }
            }

            double avgScore = (count > 0) ? (totalScore / count) : 0.0;
            String domMood = dayMoods.entrySet().stream()
                    .max(Map.Entry.comparingByValue())
                    .map(Map.Entry::getKey)
                    .orElse("Neutral");

            Map<String, Object> dayMap = new HashMap<>();
            dayMap.put("date", date.toString());
            dayMap.put("moodScore", Math.round(avgScore * 100.0) / 100.0); // range -1.0 to 1.0
            dayMap.put("dominantMood", domMood);
            dayMap.put("entryCount", dayEntries.size());
            trendList.add(dayMap);
        }

        return trendList;
    }

    public Map<String, Object> getMoodCalendar(User user, int year, int month) {
        YearMonth ym = YearMonth.of(year, month);
        LocalDate start = ym.atDay(1);
        LocalDate end = ym.atEndOfMonth();

        List<JournalEntry> entries = journalRepository.findByUserIdAndEntryDateBetweenOrderByEntryDateAsc(user.getId(), start, end);

        Map<String, Map<String, Object>> calendarDays = new HashMap<>();
        for (JournalEntry je : entries) {
            String dateStr = je.getEntryDate().toString();
            Map<String, Object> dayInfo = new HashMap<>();
            dayInfo.put("journalId", je.getId());
            dayInfo.put("title", je.getTitle());
            if (je.getMoodAnalysis() != null) {
                dayInfo.put("mood", je.getMoodAnalysis().getPredictedMood());
                dayInfo.put("sentiment", je.getMoodAnalysis().getSentiment());
            } else {
                dayInfo.put("mood", "Neutral");
                dayInfo.put("sentiment", "NEUTRAL");
            }
            calendarDays.put(dateStr, dayInfo);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("year", year);
        response.put("month", month);
        response.put("days", calendarDays);
        return response;
    }

    private int calculateStreak(List<JournalEntry> entries) {
        Set<LocalDate> dates = entries.stream()
                .map(JournalEntry::getEntryDate)
                .collect(Collectors.toCollection(TreeSet::new));

        if (dates.isEmpty()) return 0;

        LocalDate today = LocalDate.now();
        LocalDate yesterday = today.minusDays(1);

        LocalDate checkDate = dates.contains(today) ? today : (dates.contains(yesterday) ? yesterday : null);
        if (checkDate == null) return 0;

        int streak = 0;
        while (dates.contains(checkDate)) {
            streak++;
            checkDate = checkDate.minusDays(1);
        }

        return streak;
    }
}
