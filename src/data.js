const GAME_CONFIG = {
    playerSpeed: 70.0,
    companionFollowDistance: 20.0,
    companionSpeed: 60.0,
    runnerSpeed: 80.0
};

const STORY_TEXTS = {
    intro: [
        "Every year, millions gather to welcome Ganapati.",
        "But this year, something extraordinary was about to happen.",
        "When devotion fills the temple, the Ananta Jyoti awakens...",
        "BOOM!",
        "A dark magical disturbance called VIGHNA has appeared.",
        "THE BLESSINGS HAVE BEEN SCATTERED.",
        "Recover them before the final celebration begins."
    ],
    end: [
        "The blessings were never meant to make the journey easy.",
        "They were meant to guide the journey."
    ]
};

const QUIZ_DATA = {
    intro: "Welcome to the Knowledge Shrine.\nAnswer correctly to earn a Knowledge Key (Revive).",
    questions: [
        {
            q: "Who is Lord Ganesha's brother?",
            options: ["Kartikeya (Murugan)", "Hanuman", "Krishna", "Rama"],
            correct: 0
        },
        {
            q: "What is Ganesha's favored sweet?",
            options: ["Jalebi", "Modak", "Barfi", "Gulab Jamun"],
            correct: 1
        },
        {
            q: "Who is Ganesha's Vahana (vehicle)?",
            options: ["Nandi the Bull", "Garuda the Eagle", "Mooshak the Mouse", "Airavata the Elephant"],
            correct: 2
        }
    ]
};
