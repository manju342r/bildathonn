const GAME_CONFIG = {
    playerSpeed: 70.0,
    companionFollowDistance: 20.0,
    companionSpeed: 60.0,
    runnerSpeed: 80.0
};

const STORY_TEXTS = {
    intro: [
        "Long ago, on the sacred mountain of Kailash, lived Goddess Parvati and Lord Shiva.",
        "One day, Parvati created a child from her own sacred energy and breathed life into him.\nShe named him Ganesha.",
        "She gave him one command:\n\"Guard the entrance. Let no one enter without my permission.\"",
        "When Shiva returned, Ganesha stopped him — faithfully following his mother's order.",
        "BOOM!\nA fierce confrontation broke out. In the battle, Ganesha fell.",
        "Heartbroken and furious, Parvati demanded Ganesha be restored.\nShiva placed the head of an elephant upon him and brought him back to life.",
        "From that day, Ganesha became Ganapati — Lord of the Ganas.\nAnd Vighnaharta — the Remover of Obstacles.\nNow, Vighna has returned. The Ananta Jyoti is shattered.\nMooshak, you must save the festival!"
    ],
    end: [
        "Like Ganesha, who turned wisdom into victory over Kartikeya...",
        "You did not race the world. You understood it.",
        "The blessings were never meant to make the journey easy.",
        "They were meant to guide the journey."
    ]
};

const QUIZ_DATA = {
    intro: "Welcome to the Knowledge Shrine.\n\nGanesha broke his own tusk to write the Mahabharata without stopping — a symbol of dedication to knowledge.\n\nAnswer all questions correctly to earn a Knowledge Key.",
    questions: [
        {
            q: "Parvati created Ganesha and gave him one command. What was it?",
            options: [
                "Guard the entrance and let no one enter without her permission.",
                "Bring flowers from the forest.",
                "Welcome all guests to Kailash.",
                "Follow Lord Shiva wherever he goes."
            ],
            correct: 0
        },
        {
            q: "When Kartikeya flew around the world to win the challenge, what did Ganesha do instead?",
            options: [
                "He gave up and accepted defeat.",
                "He rode his mouse and tried to keep up.",
                "He walked around his parents, saying they are his entire world.",
                "He asked Shiva to stop the challenge."
            ],
            correct: 2
        },
        {
            q: "Why does Ganesha have a broken tusk?",
            options: [
                "He broke it during the battle at the entrance of Kailash.",
                "He broke it off to use as a writing instrument while writing the Mahabharata.",
                "Kartikeya broke it during their competition.",
                "It broke during the battle with Kubera."
            ],
            correct: 1
        },
        {
            q: "What lesson did Kubera learn when he invited Ganesha to his great feast?",
            options: [
                "That Ganesha is the strongest of all gods.",
                "That wealth and pride alone cannot bring true fulfillment.",
                "That Ganesha loves food more than anything.",
                "That Shiva should have attended the feast instead."
            ],
            correct: 1
        },
        {
            q: "What does Ganesha's large belly symbolize in traditional interpretations?",
            options: [
                "That he loves modaks.",
                "That he is the richest deity.",
                "The ability to accept and digest all of life's experiences — both good and bad.",
                "That he is more powerful than other gods."
            ],
            correct: 2
        }
    ]
};
