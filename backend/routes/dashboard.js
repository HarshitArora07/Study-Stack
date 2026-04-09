const express = require("express")
const router = express.Router()
const History = require("../models/History")
const jwt = require("jsonwebtoken")

// Auth Middleware
const protect = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]
  if (!token) return res.status(401).json({ message: "Unauthorized" })
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.userId = decoded.id
    next()
  } catch {
    res.status(401).json({ message: "Invalid token" })
  }
}

// GET /api/dashboard — aggregated stats for user
router.get("/", protect, async (req, res) => {
  try {
    const history = await History.find({ userId: req.userId })

    // Initialize stats
    const stats = {
      totalCode: 0,
      totalQuiz: 0,
      totalCheatsheet: 0,
      totalActivities: history.length,

      // Code stats
      codeTotalIssues: 0,
      codeTotalImprovements: 0,
      codeAnalysesWithIssues: 0,
      codePerfectCount: 0,

      // Quiz stats
      quizTotalQuestions: 0,
      quizTotalCorrect: 0,
      quizScores: [],
      quizTaken: 0,

      // Cheatsheet stats
      cheatsheetCount: 0,
      cheatsheetTotalTopics: 0,
      cheatsheetTotalRepeated: 0,

      // Timeline
      firstActivity: null,
      lastActivity: null,
      activityByDay: {},
      activityByMonth: {}
    }

    // Process each history entry
    history.forEach(entry => {
      const date = new Date(entry.createdAt)
      // Use local date string to avoid timezone issues
      const dayKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

      // Track activity by day
      stats.activityByDay[dayKey] = (stats.activityByDay[dayKey] || 0) + 1

      // Track activity by month
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      stats.activityByMonth[monthKey] = (stats.activityByMonth[monthKey] || 0) + 1

      switch (entry.type) {
        case "code":
          stats.totalCode++
          if (entry.issues?.length) {
            stats.codeTotalIssues += entry.issues.length
            if (entry.issues.length > 0) stats.codeAnalysesWithIssues++
          }
          if (entry.improvements?.length) {
            stats.codeTotalImprovements += entry.improvements.length
          }
          if (!entry.issues?.length && !entry.improvements?.length) {
            stats.codePerfectCount++
          }
          break

        case "quiz":
          stats.totalQuiz++
          stats.quizTaken++
          if (entry.score !== undefined && entry.totalQuestions) {
            const score = entry.score
            const total = entry.totalQuestions
            stats.quizTotalQuestions += total
            stats.quizTotalCorrect += score
            stats.quizScores.push({
              score,
              total,
              percentage: Math.round((score / total) * 100),
              date: entry.createdAt
            })
          }
          break

        case "cheatsheet":
          stats.totalCheatsheet++
          if (entry.importantTopics?.length) {
            stats.cheatsheetTotalTopics += entry.importantTopics.length
          }
          if (entry.repeatedTopics?.length) {
            stats.cheatsheetTotalRepeated += entry.repeatedTopics.length
          }
          break
      }
    })

    // Calculate derived metrics
    const quizAverage = stats.quizScores.length > 0
      ? Math.round(stats.quizTotalCorrect / stats.quizTotalQuestions * 100)
      : 0

    const codeAverageIssues = stats.totalCode > 0
      ? (stats.codeTotalIssues / stats.totalCode).toFixed(1)
      : 0

    // Study streak calculation (consecutive days with activity)
    const sortedDays = Object.keys(stats.activityByDay).sort()
    let currentStreak = 0
    let longestStreak = 0
    let tempStreak = 0
    const today = new Date().toISOString().split('T')[0]

    for (let i = sortedDays.length - 1; i >= 0; i--) {
      const day = sortedDays[i]
      const nextDay = i < sortedDays.length - 1 ? sortedDays[i + 1] : today
      const date = new Date(day)
      const nextDate = new Date(nextDay)
      const diffDays = Math.floor((nextDate - date) / (1000 * 60 * 60 * 24))

      if (diffDays === 1 || (i === sortedDays.length - 1 && day === today)) {
        tempStreak++
      } else {
        if (tempStreak > longestStreak) longestStreak = tempStreak
        tempStreak = 1
      }
    }
    if (tempStreak > longestStreak) longestStreak = tempStreak
    currentStreak = tempStreak

    // Find best and worst quiz scores
    const sortedQuizScores = [...stats.quizScores].sort((a, b) => b.percentage - a.percentage)
    const bestQuiz = sortedQuizScores[0]
    const worstQuiz = sortedQuizScores[sortedQuizScores.length - 1]

    // Build recent activity (last 10)
    const recentActivity = history
      .slice(0, 10)
      .map(entry => {
        const typeMap = {
          code: "Code Analysis",
          quiz: "Quiz",
          cheatsheet: "Cheat Sheet"
        }
        return {
          type: entry.type,
          label: typeMap[entry.type] || entry.type,
          date: entry.createdAt,
          summary: getActivitySummary(entry)
        }
      })

    // Build weekly activity (last 7 days)
    const weeklyActivity = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dayKey = date.toISOString().split('T')[0]
      weeklyActivity.push({
        date: dayKey,
        count: stats.activityByDay[dayKey] || 0,
        day: date.toLocaleDateString('en-US', { weekday: 'short' })
      })
    }

    // Build calendar data for last 35 days (5 weeks)
    const calendarData = []
    const todayDate = new Date()
    const daysToShow = 35 // 5 weeks
    for (let i = daysToShow - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(todayDate.getDate() - i)
      // Use local date string to match activityByDay key format
      const dayKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
      calendarData.push({
        date: dayKey,
        count: stats.activityByDay[dayKey] || 0,
        dayOfWeek: date.getDay(), // 0=Sunday, 1=Monday, ..., 6=Saturday
        dayNum: date.getDate()
      })
    }

    // Build topic competency analytics
    const topicMap = {} // { topicName: { quizzes: 0, totalScore: 0, totalQuestions: 0, cheatsheets: 0, codeAnalyses: 0 } }

    history.forEach(entry => {
      // Topics from quizzes
      if (entry.type === "quiz" && entry.quizTopics) {
        entry.quizTopics.forEach(topic => {
          if (!topicMap[topic]) topicMap[topic] = { quizzes: 0, totalScore: 0, totalQuestions: 0, cheatsheets: 0, codeAnalyses: 0 };
          topicMap[topic].quizzes++;
          topicMap[topic].totalScore += entry.score || 0;
          topicMap[topic].totalQuestions += entry.totalQuestions || 0;
        });
      }

      // Topics from cheatsheets
      if (entry.type === "cheatsheet" && entry.extractedTopics) {
        entry.extractedTopics.forEach(topic => {
          if (!topicMap[topic]) topicMap[topic] = { quizzes: 0, totalScore: 0, totalQuestions: 0, cheatsheets: 0, codeAnalyses: 0 };
          topicMap[topic].cheatsheets++;
        });
      }

      // Languages from code (treat as topics)
      if (entry.type === "code" && entry.detectedLanguage) {
        const lang = entry.detectedLanguage;
        if (!topicMap[lang]) topicMap[lang] = { quizzes: 0, totalScore: 0, totalQuestions: 0, cheatsheets: 0, codeAnalyses: 0 };
        topicMap[lang].codeAnalyses++;
      }
    });

    // Calculate competency scores (0-100) for each topic
    const topics = Object.entries(topicMap).map(([name, data]) => {
      let competency = 0;
      if (data.quizzes > 0) {
        competency = Math.round((data.totalScore / data.totalQuestions) * 100);
      } else if (data.codeAnalyses > 0) {
        // For code languages, use inverse of average issues (less issues = higher competency)
        // This would need more detailed data; for now, just use count as proxy
        competency = Math.min(data.codeAnalyses * 20, 100);
      } else if (data.cheatsheets > 0) {
        competency = Math.min(data.cheatsheets * 25, 100);
      }

      return {
        name,
        competency,
        quizzes: data.quizzes,
        cheatsheets: data.cheatsheets,
        codeAnalyses: data.codeAnalyses,
        totalActivities: data.quizzes + data.cheatsheets + data.codeAnalyses
      };
    }).filter(t => t.totalActivities > 0).sort((a, b) => b.competency - a.competency);

    // Build insights based on data
    const insights = []
    if (stats.totalCode > 0) {
      const perfectRate = Math.round((stats.codePerfectCount / stats.totalCode) * 100)
      if (perfectRate > 50) {
        insights.push(`Your code quality is excellent! ${perfectRate}% of your analyses had no issues.`)
      } else if (perfectRate < 20) {
        insights.push("Focus on writing cleaner code. Review the improvements suggested by the AI.")
      } else {
        insights.push(`You have ${stats.codePerfectCount} out of ${stats.totalCode} perfect code analyses.`)
      }
    }

    if (stats.quizScores.length > 0) {
      if (quizAverage >= 80) {
        insights.push(`Great job! Your average quiz score is ${quizAverage}%. Keep it up!`)
      } else if (quizAverage < 50) {
        insights.push("Your quiz scores can improve. Try reviewing your notes more thoroughly before generating quizzes.")
      } else {
        insights.push(`Your average quiz score is ${quizAverage}%. You're making good progress!`)
      }
    }

    if (stats.totalCheatsheet > 0) {
      const avgTopics = Math.round(stats.cheatsheetTotalTopics / stats.totalCheatsheet)
      insights.push(`You've created ${stats.totalCheatsheet} cheat sheets with an average of ${avgTopics} important topics.`)
    }

    if (longestStreak >= 3) {
      insights.push(`Your longest study streak is ${longestStreak} days! Maintain that momentum!`)
    } else if (currentStreak > 0) {
      insights.push(`You're on a ${currentStreak}-day streak! Keep going!`)
    }

    // response
    res.json({
      overview: {
        totalActivities: stats.totalActivities,
        totalCode: stats.totalCode,
        totalQuiz: stats.totalQuiz,
        totalCheatsheet: stats.totalCheatsheet,
        firstActivity: history.length > 0 ? history[history.length - 1].createdAt : null,
        lastActivity: history.length > 0 ? history[0].createdAt : null
      },
      code: {
        totalAnalyses: stats.totalCode,
        totalIssues: stats.codeTotalIssues,
        totalImprovements: stats.codeTotalImprovements,
        perfectCount: stats.codePerfectCount,
        averageIssues: parseFloat(codeAverageIssues),
        languageBreakdown: stats.codeTypes // counts by detected language
      },
      quiz: {
        totalQuizzes: stats.quizTaken,
        totalQuestions: stats.quizTotalQuestions,
        totalCorrect: stats.quizTotalCorrect,
        averageScore: quizAverage,
        bestScore: bestQuiz ? bestQuiz.percentage : null,
        worstScore: worstQuiz ? worstQuiz.percentage : null,
        scores: stats.quizScores
      },
      cheatsheet: {
        totalGenerated: stats.totalCheatsheet,
        totalTopics: stats.cheatsheetTotalTopics,
        totalRepeated: stats.cheatsheetTotalRepeated,
        topicBreakdown: stats.cheatsheetTypes // counts by contentType
      },
      streaks: {
        currentStreak,
        longestStreak,
        activityByDay: stats.activityByDay,
        activityByMonth: stats.activityByMonth
      },
      weeklyActivity,
      calendarData,
      recentActivity,
      insights: insights.length > 0 ? insights : ["Keep using StudyStack to unlock personalized insights!"]
    })

  } catch (err) {
    console.error("Dashboard error:", err)
    res.status(500).json({ message: "Server error" })
  }
})

// Helper function to generate activity summary
function getActivitySummary(entry) {
  switch (entry.type) {
    case "code":
      const issuesCount = entry.issues?.length || 0
      return issuesCount > 0
        ? `Found ${issuesCount} issue${issuesCount > 1 ? 's' : ''}`
        : "Code is clean!"

    case "quiz":
      return `Scored ${entry.score}/${entry.totalQuestions} (${Math.round((entry.score/entry.totalQuestions)*100)}%)`

    case "cheatsheet":
      const topicsCount = entry.importantTopics?.length || 0
      return `Generated with ${topicsCount} important topic${topicsCount !== 1 ? 's' : ''}`

    default:
      return "Activity recorded"
  }
}

// GET /api/performance — detailed performance analytics
router.get("/performance", protect, async (req, res) => {
  try {
    const history = await History.find({ userId: req.userId })

    // Same aggregation logic as dashboard but with more details
    const stats = {
      totalCode: 0,
      totalQuiz: 0,
      totalCheatsheet: 0,
      codeAnalysesWithIssues: 0,
      codePerfectCount: 0,
      codeTypes: {},
      quizScores: [],
      cheatsheetTypes: {},
      monthlyActivity: {},
      weeklyActivity: [],
      recentActivities: []
    }

    // Process history
    history.forEach(entry => {
      const date = new Date(entry.createdAt)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

      stats.monthlyActivity[monthKey] = (stats.monthlyActivity[monthKey] || 0) + 1

      switch (entry.type) {
        case "code":
          stats.totalCode++
          if (entry.issues?.length > 0) stats.codeAnalysesWithIssues++
          if (!entry.issues?.length && !entry.improvements?.length) stats.codePerfectCount++
          // Track issue types by analyzing first word
          entry.issues?.forEach(issue => {
            const firstWord = issue.split(' ')[0].toLowerCase().replace(/[^a-z]/g, '')
            stats.codeTypes[firstWord] = (stats.codeTypes[firstWord] || 0) + 1
          })
          break

        case "quiz":
          stats.totalQuiz++
          if (entry.score !== undefined && entry.totalQuestions) {
            stats.quizScores.push({
              score: entry.score,
              total: entry.totalQuestions,
              percentage: Math.round((entry.score / entry.totalQuestions) * 100),
              date: entry.createdAt
            })
          }
          break

        case "cheatsheet":
          stats.totalCheatsheet++
          if (entry.contentType) {
            stats.cheatsheetTypes[entry.contentType] = (stats.cheatsheetTypes[entry.contentType] || 0) + 1
          }
          break
      }
    })

    // Build weekly activity (last 30 days)
    for (let i = 29; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dayKey = date.toISOString().split('T')[0]
      const count = history.filter(h => {
        const hDate = new Date(h.createdAt).toISOString().split('T')[0]
        return hDate === dayKey
      }).length
      stats.weeklyActivity.push({
        date: dayKey,
        count,
        day: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      })
    }

    // Recent activities (last 20)
    stats.recentActivities = history
      .slice(0, 20)
      .map(entry => ({
        type: entry.type,
        date: entry.createdAt,
        summary: getActivitySummary(entry)
      }))

    // Quiz score history for chart
    const quizHistory = stats.quizScores.map((q, i) => ({
      index: i + 1,
      score: q.percentage
    }))

    // Build topic competency analytics
    const topicMap = {} // { topicName: { quizzes: 0, totalScore: 0, totalQuestions: 0, cheatsheets: 0, codeAnalyses: 0 } }

    history.forEach(entry => {
      // Topics from quizzes
      if (entry.type === "quiz" && entry.quizTopics) {
        entry.quizTopics.forEach(topic => {
          if (!topicMap[topic]) topicMap[topic] = { quizzes: 0, totalScore: 0, totalQuestions: 0, cheatsheets: 0, codeAnalyses: 0 };
          topicMap[topic].quizzes++;
          topicMap[topic].totalScore += entry.score || 0;
          topicMap[topic].totalQuestions += entry.totalQuestions || 0;
        });
      }

      // Topics from cheatsheets
      if (entry.type === "cheatsheet" && entry.extractedTopics) {
        entry.extractedTopics.forEach(topic => {
          if (!topicMap[topic]) topicMap[topic] = { quizzes: 0, totalScore: 0, totalQuestions: 0, cheatsheets: 0, codeAnalyses: 0 };
          topicMap[topic].cheatsheets++;
        });
      }

      // Languages from code (treat as topics)
      if (entry.type === "code" && entry.detectedLanguage) {
        const lang = entry.detectedLanguage;
        if (!topicMap[lang]) topicMap[lang] = { quizzes: 0, totalScore: 0, totalQuestions: 0, cheatsheets: 0, codeAnalyses: 0 };
        topicMap[lang].codeAnalyses++;
      }
    });

    // Calculate competency scores (0-100) for each topic
    stats.topics = Object.entries(topicMap).map(([name, data]) => {
      let competency = 0;
      if (data.quizzes > 0) {
        competency = Math.round((data.totalScore / data.totalQuestions) * 100);
      } else if (data.codeAnalyses > 0) {
        competency = Math.min(data.codeAnalyses * 20, 100);
      } else if (data.cheatsheets > 0) {
        competency = Math.min(data.cheatsheets * 25, 100);
      }

      return {
        name,
        competency,
        quizzes: data.quizzes,
        cheatsheets: data.cheatsheets,
        codeAnalyses: data.codeAnalyses,
        totalActivities: data.quizzes + data.cheatsheets + data.codeAnalyses
      };
    }).filter(t => t.totalActivities > 0).sort((a, b) => b.competency - a.competency);

    res.json(stats)

  } catch (err) {
    console.error("Performance error:", err)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router

