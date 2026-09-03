// LUNA PERSONAL AI ASSISTANT
// Natural Voice & Conversation Upgrade

// DATA

let tasks = JSON.parse(localStorage.getItem("lunaTasks")) || [];
let events = JSON.parse(localStorage.getItem("lunaEvents")) || [];
let projects = JSON.parse(localStorage.getItem("lunaProjects")) || [];
let memories = JSON.parse(localStorage.getItem("lunaMemories")) || [];
let habits = JSON.parse(localStorage.getItem("lunaHabits")) || [];
let expenses = JSON.parse(localStorage.getItem("lunaExpenses")) || [];

let currentFilter = "all";


// ==========================================
// LUNA CONVERSATION MEMORY
// ==========================================

let conversationMemory = {
    lastTopic: null,
    lastProject: null,
    lastTask: null
};


// ==========================================
// VOICE SYSTEM
// ==========================================

let voiceModeActive = false;
let recognition = null;
let recognitionSupported = false;
let lunaVoice = null;
let lunaIsSpeaking = false;
let shouldRestartListening = false;


// ==========================================
// ELEMENTS
// ==========================================

const taskInput = document.getElementById("task-input");
const taskPriority = document.getElementById("task-priority");
const taskDate = document.getElementById("task-date");

const eventInput = document.getElementById("event-input");
const eventDate = document.getElementById("event-date");
const eventTime = document.getElementById("event-time");

const projectInput = document.getElementById("project-input");
const projectDeadline = document.getElementById("project-deadline");
const projectStatus = document.getElementById("project-status");

const chatInput = document.getElementById("chat-input");
const chatMessages = document.getElementById("chat-messages");


// ==========================================
// INITIALIZATION
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    setTodayDates();
    updateDate();
    updateGreeting();

    renderTasks();
    renderEvents();
    renderProjects();
    renderMemories();
    renderHabits();
    renderExpenses();

    updateDashboard();

    setupNavigation();
    setupButtons();

    loadBestVoice();

    if ("speechSynthesis" in window) {
        speechSynthesis.onvoiceschanged = loadBestVoice;
    }

});


// ==========================================
// DATE
// ==========================================

function getTodayString() {

    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;

}


function setTodayDates() {

    const today = getTodayString();

    if (taskDate && !taskDate.value) {
        taskDate.value = today;
    }

    if (eventDate && !eventDate.value) {
        eventDate.value = today;
    }

}


function updateDate() {

    const dateElement =
        document.getElementById("current-date");

    if (!dateElement) return;

    dateElement.textContent =
        new Date().toLocaleDateString(
            "en-US",
            {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric"
            }
        );

}


function updateGreeting() {

    const greetingElement =
        document.getElementById("time-greeting");

    if (!greetingElement) return;

    const hour = new Date().getHours();

    let greeting;

    if (hour < 12) {
        greeting = "Good morning";
    } else if (hour < 18) {
        greeting = "Good afternoon";
    } else {
        greeting = "Good evening";
    }

    greetingElement.textContent = `${greeting} 👋`;

}


// ==========================================
// NAVIGATION
// ==========================================

function setupNavigation() {

    document.querySelectorAll(".nav-btn")
        .forEach(function (button) {

            button.addEventListener("click", function () {

                showSection(button.dataset.section);

                const sidebar =
                    document.querySelector(".sidebar");

                if (sidebar) {
                    sidebar.classList.remove("open");
                }

            });

        });

}


function showSection(sectionId) {

    document.querySelectorAll(".page-section")
        .forEach(function (section) {
            section.classList.remove("active");
        });

    document.querySelectorAll(".nav-btn")
        .forEach(function (button) {
            button.classList.remove("active");
        });

    const section =
        document.getElementById(sectionId);

    if (section) {
        section.classList.add("active");
    }

    const activeButton =
        document.querySelector(
            `[data-section="${sectionId}"]`
        );

    if (activeButton) {
        activeButton.classList.add("active");
    }

}


// ==========================================
// MOBILE MENU
// ==========================================

const menuToggle =
    document.getElementById("menu-toggle");

if (menuToggle) {

    menuToggle.addEventListener(
        "click",
        function () {

            const sidebar =
                document.querySelector(".sidebar");

            if (sidebar) {
                sidebar.classList.toggle("open");
            }

        }
    );

}


// ==========================================
// BUTTON SETUP
// ==========================================

function setupButtons() {

    const addTaskButton =
        document.getElementById("add-task-btn");

    const addEventButton =
        document.getElementById("add-event-btn");

    const addProjectButton =
        document.getElementById("add-project-btn");

    const addMemoryButton =
        document.getElementById("add-memory-btn");

    const addHabitButton = 
        document.getElementById("add-habit-btn");

    const addExpenseButton =
        document.getElementById("add-expense-btn");

    const sendButton =
        document.getElementById("send-btn");


    if (addTaskButton) {
        addTaskButton.addEventListener("click", addTask);
    }

    if (addEventButton) {
        addEventButton.addEventListener("click", addEvent);
    }

    if (addProjectButton) {
        addProjectButton.addEventListener("click", addProject);
    }

    if (addMemoryButton) {
        addMemoryButton.addEventListener(
            "click",
            addMemory
        );

    if (addHabitButton) {
        addHabitButton.addHabitListener(
            "click",
            addHabit
        );

    if (addExpenseButton) {
        addExpenseButton.addEventListener(
            "click",
            addExpense
        );
        

    if (sendButton) {
        sendButton.addEventListener("click", sendMessage);
    }


    if (chatInput) {

        chatInput.addEventListener(
            "keydown",
            function (event) {

                if (event.key === "Enter") {
                    sendMessage();
                }

            }
        );

    }


    document.querySelectorAll(".filter-btn")
        .forEach(function (button) {

            button.addEventListener(
                "click",
                function () {

                    currentFilter =
                        button.dataset.filter;

                    document.querySelectorAll(
                        ".filter-btn"
                    ).forEach(function (btn) {
                        btn.classList.remove("active");
                    });

                    button.classList.add("active");

                    renderTasks();

                }
            );

        });


    setupVoiceRecognition();

}


// ==========================================
// TASKS
// ==========================================

function addTask() {

    const text = taskInput.value.trim();

    if (!text) {
        alert("Please enter a task.");
        return;
    }

    tasks.push({
        id: Date.now(),
        text: text,
        priority: taskPriority.value,
        date: taskDate.value,
        completed: false
    });

    saveTasks();

    taskInput.value = "";

    renderTasks();
    updateDashboard();

}


function saveTasks() {
    localStorage.setItem(
        "lunaTasks",
        JSON.stringify(tasks)
    );
}


function renderTasks() {

    const taskList =
        document.getElementById("task-list");

    if (!taskList) return;

    taskList.innerHTML = "";

    let filteredTasks = tasks;

    if (currentFilter === "active") {
        filteredTasks =
            tasks.filter(task => !task.completed);
    }

    if (currentFilter === "completed") {
        filteredTasks =
            tasks.filter(task => task.completed);
    }

    if (filteredTasks.length === 0) {

        taskList.innerHTML = `
            <div class="empty-state">
                No tasks here yet. ✨
            </div>
        `;

        return;
    }

    filteredTasks.forEach(function (task) {

        const taskElement =
            document.createElement("div");

        taskElement.className =
            "task-item" +
            (task.completed ? " completed" : "");

        taskElement.innerHTML = `
            <input
                type="checkbox"
                class="task-checkbox"
                ${task.completed ? "checked" : ""}
                onchange="toggleTask(${task.id})"
            >

            <div class="task-info">
                <h4>${escapeHTML(task.text)}</h4>
                <p>
                    ${task.date
                        ? formatDate(task.date)
                        : "No due date"}
                </p>
            </div>

            <span class="priority ${task.priority}">
                ${task.priority}
            </span>

            <button
                class="delete-btn"
                onclick="deleteTask(${task.id})"
            >
                ×
            </button>
        `;

        taskList.appendChild(taskElement);

    });

}


function toggleTask(id) {

    tasks = tasks.map(function (task) {

        if (task.id === id) {
            task.completed = !task.completed;
        }

        return task;

    });

    saveTasks();
    renderTasks();
    updateDashboard();

}


function deleteTask(id) {

    tasks =
        tasks.filter(task => task.id !== id);

    saveTasks();
    renderTasks();
    updateDashboard();

}


// ==========================================
// EVENTS
// ==========================================

function addEvent() {

    const text = eventInput.value.trim();

    if (!text) {
        alert("Please enter an event.");
        return;
    }

    events.push({
        id: Date.now(),
        text: text,
        date: eventDate.value,
        time: eventTime.value
    });

    sortEvents();
    saveEvents();

    eventInput.value = "";
    eventTime.value = "";

    renderEvents();
    updateDashboard();

}


function sortEvents() {

    events.sort(function (a, b) {

        const first =
            new Date(
                `${a.date}T${a.time || "00:00"}`
            );

        const second =
            new Date(
                `${b.date}T${b.time || "00:00"}`
            );

        return first - second;

    });

}


function saveEvents() {
    localStorage.setItem(
        "lunaEvents",
        JSON.stringify(events)
    );
}


function renderEvents() {

    const scheduleList =
        document.getElementById("schedule-list");

    if (!scheduleList) return;

    scheduleList.innerHTML = "";

    if (events.length === 0) {

        scheduleList.innerHTML = `
            <div class="empty-state">
                Your schedule is completely open. ☀️
            </div>
        `;

        return;
    }

    events.forEach(function (event) {

        const eventElement =
            document.createElement("div");

        eventElement.className =
            "schedule-item";

        eventElement.innerHTML = `
            <div class="event-time">
                ${event.time || "--:--"}
            </div>

            <div class="event-info">
                <h4>${escapeHTML(event.text)}</h4>
                <p>${formatDate(event.date)}</p>
            </div>

            <button
                class="delete-btn"
                onclick="deleteEvent(${event.id})"
            >
                ×
            </button>
        `;

        scheduleList.appendChild(eventElement);

    });

}


function deleteEvent(id) {

    events =
        events.filter(event => event.id !== id);

    saveEvents();
    renderEvents();
    updateDashboard();

}


// ==========================================
// PROJECTS
// ==========================================

function addProject() {

    const name = projectInput.value.trim();

    if (!name) {
        alert("Please enter a project name.");
        return;
    }

    projects.push({
        id: Date.now(),
        name: name,
        deadline: projectDeadline.value,
        status: projectStatus.value
    });

    saveProjects();

    projectInput.value = "";
    projectDeadline.value = "";

    renderProjects();
    updateDashboard();

}


function saveProjects() {

    localStorage.setItem(
        "lunaProjects",
        JSON.stringify(projects)
    );

}


function renderProjects() {

    const projectList =
        document.getElementById("project-list");

    if (!projectList) return;

    projectList.innerHTML = "";

    if (projects.length === 0) {

        projectList.innerHTML = `
            <div class="empty-state">
                No projects yet. 🚀
            </div>
        `;

        return;
    }

    const sortedProjects =
        [...projects].sort(function (a, b) {

            if (!a.deadline) return 1;
            if (!b.deadline) return -1;

            return new Date(a.deadline)
                - new Date(b.deadline);

        });

    sortedProjects.forEach(function (project) {

        const item =
            document.createElement("div");

        item.className = "project-item";

        item.innerHTML = `
            <div class="project-info">

                <h3>
                    ${escapeHTML(project.name)}
                </h3>

                <p class="${
                    isDeadlineClose(project.deadline)
                        ? "deadline-warning"
                        : ""
                }">

                    📅 ${
                        project.deadline
                            ? getDeadlineText(project.deadline)
                            : "No deadline"
                    }

                </p>

            </div>

            <span
                class="
                    project-status
                    ${project.status}
                "
            >
                ${formatStatus(project.status)}
            </span>

            <button
                class="delete-btn"
                onclick="deleteProject(${project.id})"
            >
                ×
            </button>
        `;

        projectList.appendChild(item);

    });

}


function deleteProject(id) {

    projects =
        projects.filter(
            project => project.id !== id
        );

    saveProjects();
    renderProjects();
    updateDashboard();

}


// ==========================================
// FREE TIME
// ==========================================

function getFreeTimeSummary() {

    const today = getTodayString();

    const todaysEvents =
        events
            .filter(event =>
                event.date === today &&
                event.time
            )
            .sort((a, b) =>
                a.time.localeCompare(b.time)
            );

    if (todaysEvents.length === 0) {
        return "Your schedule is completely open today.";
    }

    let freeTimes = [];

    const dayStart = 8 * 60;
    const dayEnd = 20 * 60;

    let currentTime = dayStart;

    todaysEvents.forEach(function (event) {

        const eventStart =
            timeToMinutes(event.time);

        if (eventStart > currentTime) {

            freeTimes.push({
                start: currentTime,
                end: eventStart
            });

        }

        // Events are estimated at one hour.
        currentTime =
            Math.max(
                currentTime,
                eventStart + 60
            );

    });

    if (currentTime < dayEnd) {

        freeTimes.push({
            start: currentTime,
            end: dayEnd
        });

    }

    const validTimes =
        freeTimes.filter(
            slot => slot.end - slot.start >= 30
        );

    if (validTimes.length === 0) {
        return "Your day appears to be fully booked.";
    }

    return validTimes
        .map(slot =>
            `${minutesToTime(slot.start)}
             to ${minutesToTime(slot.end)}`
        )
        .join(", ");

}


function analyzeFreeTime() {

    const result =
        getFreeTimeSummary();

    const display =
        document.getElementById(
            "free-time-display"
        );

    if (display) {
        display.textContent = result;
    }

    speak(
        `I checked your schedule. ${result}`
    );

}


function timeToMinutes(time) {

    const parts = time.split(":");

    return (
        parseInt(parts[0]) * 60 +
        parseInt(parts[1])
    );

}


function minutesToTime(minutes) {

    const date = new Date();

    date.setHours(
        Math.floor(minutes / 60),
        minutes % 60
    );

    return date.toLocaleTimeString(
        "en-US",
        {
            hour: "numeric",
            minute: "2-digit"
        }
    );

}


// ==========================================
// DEADLINES
// ==========================================

function getDaysUntil(dateString) {

    if (!dateString) return null;

    const today = new Date();

    today.setHours(0, 0, 0, 0);

    const deadline =
        new Date(
            dateString + "T00:00:00"
        );

    const difference =
        deadline - today;

    return Math.ceil(
        difference /
        (1000 * 60 * 60 * 24)
    );

}


function getDeadlineText(deadline) {

    const days =
        getDaysUntil(deadline);

    if (days === 0) return "Due today";

    if (days === 1) return "Due tomorrow";

    if (days > 1) {

        return `
            Due in ${days} days
            • ${formatDate(deadline)}
        `;

    }

    return `
        Deadline passed
        • ${formatDate(deadline)}
    `;

}


function isDeadlineClose(deadline) {

    if (!deadline) return false;

    const days =
        getDaysUntil(deadline);

    return days >= 0 && days <= 3;

}


function formatStatus(status) {

    if (status === "in-progress") {
        return "In Progress";
    }

    return (
        status.charAt(0).toUpperCase() +
        status.slice(1)
    );

}


// ==========================================
// DASHBOARD
// ==========================================

function updateDashboard() {

    const activeTasks =
        tasks.filter(task => !task.completed);

    const today =
        getTodayString();

    const todaysEvents =
        events.filter(
            event => event.date === today
        );

    const activeProjects =
        projects.filter(
            project =>
                project.status !== "completed"
        );

    const taskCount =
        document.getElementById("task-count");

    const scheduleCount =
        document.getElementById("schedule-count");

    const projectCount =
        document.getElementById("project-count");

    if (taskCount) {
        taskCount.textContent =
            activeTasks.length;
    }

    if (scheduleCount) {
        scheduleCount.textContent =
            todaysEvents.length;
    }

    if (projectCount) {
        projectCount.textContent =
            activeProjects.length;
    }

    updateDailyAdvice(
        activeTasks,
        todaysEvents,
        activeProjects
    );

    renderDashboardTasks(activeTasks);
    renderDashboardProjects(activeProjects);

}


function updateDailyAdvice(
    activeTasks,
    todaysEvents,
    activeProjects
) {

    const greeting =
        document.getElementById(
            "daily-greeting"
        );

    const advice =
        document.getElementById(
            "daily-advice"
        );

    if (!greeting || !advice) return;

    const urgentProject =
        activeProjects.find(
            project =>
                project.deadline &&
                isDeadlineClose(
                    project.deadline
                )
        );

    if (urgentProject) {

        greeting.textContent =
            "You have a deadline approaching.";

        advice.textContent =
            `"${urgentProject.name}" ${
                getDeadlineText(
                    urgentProject.deadline
                )
            }. I recommend giving it
            some attention today.`;

        return;
    }

    if (activeTasks.length > 5) {

        greeting.textContent =
            "You have a busy workload.";

        advice.textContent =
            "Let's focus on the most important things first.";

        return;
    }

    if (
        activeTasks.length === 0 &&
        todaysEvents.length === 0
    ) {

        greeting.textContent =
            "You have a fresh start today.";

        advice.textContent =
            "Your schedule is open. This could be a good opportunity to work on a project.";

        return;
    }

    greeting.textContent =
        "You have a manageable day ahead.";

    advice.textContent =
        "Take things one step at a time.";

}


function renderDashboardTasks(activeTasks) {

    const container =
        document.getElementById(
            "dashboard-tasks"
        );

    if (!container) return;

    container.innerHTML = "";

    const upcoming =
        [...activeTasks]
            .sort((a, b) => {

                if (!a.date) return 1;
                if (!b.date) return -1;

                return new Date(a.date)
                    - new Date(b.date);

            })
            .slice(0, 5);

    if (upcoming.length === 0) {

        container.innerHTML = `
            <div class="empty-state">
                No active tasks. 🎉
            </div>
        `;

        return;
    }

    upcoming.forEach(function (task) {

        const item =
            document.createElement("div");

        item.className = "mini-item";

        item.innerHTML = `
            <div>
                <strong>
                    ${escapeHTML(task.text)}
                </strong>

                <p>
                    ${
                        task.date
                            ? formatDate(task.date)
                            : "No due date"
                    }
                </p>
            </div>

            <span
                class="
                    priority
                    ${task.priority}
                "
            >
                ${task.priority}
            </span>
        `;

        container.appendChild(item);

    });

}


function renderDashboardProjects(activeProjects) {

    const container =
        document.getElementById(
            "dashboard-projects"
        );

    if (!container) return;

    container.innerHTML = "";

    const upcoming =
        [...activeProjects]
            .filter(
                project => project.deadline
            )
            .sort((a, b) =>
                new Date(a.deadline)
                - new Date(b.deadline)
            )
            .slice(0, 5);

    if (upcoming.length === 0) {

        container.innerHTML = `
            <div class="empty-state">
                No upcoming deadlines.
            </div>
        `;

        return;
    }

    upcoming.forEach(function (project) {

        const item =
            document.createElement("div");

        item.className = "mini-item";

        item.innerHTML = `
            <div>
                <strong>
                    ${escapeHTML(project.name)}
                </strong>

                <p>
                    ${getDeadlineText(
                        project.deadline
                    )}
                </p>
            </div>

            <span
                class="
                    project-status
                    ${project.status}
                "
            >
                ${formatStatus(
                    project.status
                )}
            </span>
        `;

        container.appendChild(item);

    });

}


// ==========================================
// DAILY BRIEFING
// ==========================================

function giveDailyBriefing() {

    const today =
        getTodayString();

    const activeTasks =
        tasks.filter(task => !task.completed);

    const todaysEvents =
        events.filter(
            event => event.date === today
        );

    const upcomingProjects =
        projects
            .filter(
                project =>
                    project.status !== "completed" &&
                    project.deadline
            )
            .sort((a, b) =>
                new Date(a.deadline)
                - new Date(b.deadline)
            );

    let briefing =
        "Good day. Here's your personal briefing. ";

    briefing +=
        `You currently have ${activeTasks.length}
        active task${
            activeTasks.length === 1 ? "" : "s"
        }. `;

    if (todaysEvents.length === 0) {

        briefing +=
            "Your schedule is completely open today. ";

    } else {

        briefing +=
            `You have ${todaysEvents.length}
            scheduled event${
                todaysEvents.length === 1 ? "" : "s"
            } today. `;

    }

    if (upcomingProjects.length > 0) {

        const next =
            upcomingProjects[0];

        briefing +=
            `Your closest project deadline is
            ${next.name}. ${
                getDeadlineText(
                    next.deadline
                )
            }. `;

    }

    briefing +=
        `As for your free time,
        ${getFreeTimeSummary()}`;

    showSection("assistant");

    addChatMessage(briefing, "ai");

    speak(briefing);

}

// ==========================================
// LUNA 1.6 - NATURAL TASK RECOGNITION
// ==========================================

function detectTaskRequest(message) {

    const text = message.toLowerCase().trim();

    const taskPatterns = [
        "i need to",
        "i have to",
        "remind me to",
        "add a task",
        "add task",
        "remember to",
        "i should",
        "i must",
        "don't let me forget to",
        "do not let me forget to"
    ];

    for (const pattern of taskPatterns) {

        if (text.includes(pattern)) {

            return {
                isTask: true,
                pattern: pattern
            };

        }

    }

    return {
        isTask: false
    };

}


// ==========================================
// EXTRACT TASK NAME
// ==========================================

function extractTask(message, pattern) {

    const lowerMessage =
        message.toLowerCase();

    const index =
        lowerMessage.indexOf(pattern);

    if (index === -1) {
        return "";
    }

    let task =
        message
            .substring(
                index + pattern.length
            )
            .trim();

    // Remove "to" from the beginning.

    task = task.replace(
        /^to\s+/i,
        ""
    );

    // Remove LUNA's name.

    task = task.replace(
        /^luna[,\s]*/i,
        ""
    );

    // Remove ending punctuation.

    task = task.replace(
        /[.!?]+$/,
        ""
    );

    return task;

}


// ==========================================
// DETECT DEADLINE
// ==========================================

function detectTaskDeadline(message) {

    const text =
        message.toLowerCase();

    if (text.includes("by today")) {
        return getTodayString();
    }

    if (text.includes("by tomorrow")) {

        const tomorrow =
            new Date();

        tomorrow.setDate(
            tomorrow.getDate() + 1
        );

        return formatDateForInput(
            tomorrow
        );

    }

    const days = [
        "sunday",
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday"
    ];

    for (const day of days) {

        if (text.includes(`by ${day}`)) {

            return getNextWeekday(day);

        }

    }

    return "";

}


// ==========================================
// GET NEXT WEEKDAY
// ==========================================

function getNextWeekday(dayName) {

    const days = [
        "sunday",
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday"
    ];

    const targetDay =
        days.indexOf(dayName);

    const today =
        new Date();

    const currentDay =
        today.getDay();

    let difference =
        targetDay - currentDay;

    if (difference <= 0) {
        difference += 7;
    }

    const result =
        new Date();

    result.setDate(
        today.getDate() + difference
    );

    return formatDateForInput(result);

}


// ==========================================
// FORMAT DATE FOR INPUT
// ==========================================

function formatDateForInput(date) {

    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            date.getDate()
        ).padStart(2, "0");

    return `${year}-${month}-${day}`;

}


// ==========================================
// CREATE NATURAL TASK
// ==========================================

function addNaturalTask(message) {

    const detection =
        detectTaskRequest(message);

    if (!detection.isTask) {
        return null;
    }

    let taskName =
        extractTask(
            message,
            detection.pattern
        );

    const deadline =
        detectTaskDeadline(message);


    // Remove deadline words from task name.

    if (deadline) {

        const deadlinePatterns = [
            /by today/i,
            /by tomorrow/i,
            /by sunday/i,
            /by monday/i,
            /by tuesday/i,
            /by wednesday/i,
            /by thursday/i,
            /by friday/i,
            /by saturday/i
        ];

        deadlinePatterns.forEach(
            function (pattern) {

                taskName =
                    taskName.replace(
                        pattern,
                        ""
                    ).trim();

            }
        );

    }


    if (!taskName) {
        return null;
    }


    const newTask = {

        id: Date.now(),

        text: taskName,

        priority: "medium",

        date: deadline,

        completed: false

    };


    // Add to LUNA's REAL task system.

    tasks.push(newTask);

    saveTasks();

    renderTasks();

    updateDashboard();


    return newTask;

}

function saveTasks() {

    localStorage.setItem(
        "lunaTasks",
        JSON.stringify(tasks)
    );

}

// ==========================================
// LUNA 1.6 - NATURAL SCHEDULE RECOGNITION
// ==========================================

function detectScheduleRequest(message) {

    const text = message.toLowerCase();

    const schedulePatterns = [
        "i have",
        "i've got",
        "add an event",
        "add event",
        "schedule",
        "appointment",
        "meeting",
        "class"
    ];

    for (const pattern of schedulePatterns) {

        if (text.includes(pattern)) {

            return {
                isSchedule: true,
                pattern: pattern
            };

        }

    }

    return {
        isSchedule: false
    };

}


// ==========================================
// DETECT EVENT DATE
// ==========================================

function detectEventDate(message) {

    const text = message.toLowerCase();

    const today = new Date();


    // TODAY

    if (text.includes("today")) {

        return getTodayString();

    }


    // TOMORROW

    if (text.includes("tomorrow")) {

        const tomorrow = new Date();

        tomorrow.setDate(
            tomorrow.getDate() + 1
        );

        return formatDateForInput(
            tomorrow
        );

    }


    // DAYS OF THE WEEK

    const days = [
        "sunday",
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday"
    ];

    for (const day of days) {

        if (
            text.includes(`on ${day}`) ||
            text.includes(`this ${day}`) ||
            text.includes(`next ${day}`)
        ) {

            return getNextWeekday(day);

        }

    }


    return "";

}


// ==========================================
// DETECT EVENT TIME
// ==========================================

function detectEventTime(message) {

    const text = message.toLowerCase();


    // Example: 2 PM / 2PM

    const timeMatch =
        text.match(
            /\b(\d{1,2})\s*(am|pm)\b/i
        );

    if (timeMatch) {

        let hour =
            parseInt(timeMatch[1]);

        const period =
            timeMatch[2].toLowerCase();

        if (
            period === "pm" &&
            hour !== 12
        ) {

            hour += 12;

        }

        if (
            period === "am" &&
            hour === 12
        ) {

            hour = 0;

        }

        return (
            String(hour).padStart(2, "0") +
            ":00"
        );

    }


    // Example: 14:30

    const twentyFourHourMatch =
        text.match(
            /\b([01]?\d|2[0-3]):([0-5]\d)\b/
        );

    if (twentyFourHourMatch) {

        return (
            twentyFourHourMatch[1]
                .padStart(2, "0") +
            ":" +
            twentyFourHourMatch[2]
        );

    }


    return "";

}


// ==========================================
// EXTRACT EVENT NAME
// ==========================================

function extractEventName(message) {

    let eventName = message;


    // Remove LUNA's name.

    eventName =
        eventName.replace(
            /^(hey |hi )?luna[,\s]*/i,
            ""
        );


    // Remove common introduction phrases.

    const phrases = [
        "i have",
        "i've got",
        "add an event called",
        "add an event",
        "add event",
        "schedule"
    ];

    for (const phrase of phrases) {

        const regex =
            new RegExp(
                phrase,
                "i"
            );

        eventName =
            eventName.replace(
                regex,
                ""
            );

    }


    // Remove date phrases.

    eventName =
        eventName.replace(
            /\btoday\b/gi,
            ""
        );

    eventName =
        eventName.replace(
            /\btomorrow\b/gi,
            ""
        );

    eventName =
        eventName.replace(
            /\b(on|this|next)\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/gi,
            ""
        );


    // Remove time phrases.

    eventName =
        eventName.replace(
            /\bat\s+\d{1,2}\s*(am|pm)\b/gi,
            ""
        );

    eventName =
        eventName.replace(
            /\b\d{1,2}\s*(am|pm)\b/gi,
            ""
        );

    eventName =
        eventName.replace(
            /\bat\s+[01]?\d|2[0-3]:[0-5]\d\b/gi,
            ""
        );


    // Clean unnecessary words.

    eventName =
        eventName
            .replace(/\bat\b/gi, "")
            .replace(/\bon\b/gi, "")
            .replace(/\s+/g, " ")
            .replace(/[,.!?]+$/g, "")
            .trim();


    return eventName;

}


// ==========================================
// CREATE NATURAL EVENT
// ==========================================

function addNaturalEvent(message) {

    const detection =
        detectScheduleRequest(message);


    if (!detection.isSchedule) {

        return null;

    }


    const date =
        detectEventDate(message);

    const time =
        detectEventTime(message);


    // Only automatically create an event
    // when LUNA can identify a date.

    if (!date) {

        return null;

    }


    const eventName =
        extractEventName(message);


    if (!eventName) {

        return null;

    }


    const newEvent = {

        id: Date.now(),

        text: eventName,

        date: date,

        time: time

    };


    events.push(newEvent);

    sortEvents();

    saveEvents();

    renderEvents();

    updateDashboard();


    return newEvent;

}

// ==========================================
// MEMORY
// ==========================================

function addMemory() {

    const memoryInput =
        document.getElementById("memory-input");

    const text =
        memoryInput.value.trim();

    if (!text) {

        alert(
            "Please write something for LUNA to remember."
        );

        return;

    }


    memories.push({

        id: Date.now(),

        text: text,

        date:
            new Date().toISOString()

    });


    saveMemories();

    memoryInput.value = "";

    renderMemories();

}


function saveMemories() {

    localStorage.setItem(
        "lunaMemories",
        JSON.stringify(memories)
    );

}


function renderMemories() {

    const memoryList =
        document.getElementById("memory-list");

    if (!memoryList) return;


    memoryList.innerHTML = "";


    if (memories.length === 0) {

        memoryList.innerHTML = `

            <div class="empty-state">

                Nothing saved yet. 🧠✨

            </div>

        `;

        return;

    }


    memories
        .slice()
        .reverse()
        .forEach(function (memory) {

            const memoryElement =
                document.createElement("div");

            memoryElement.className =
                "memory-item";


            memoryElement.innerHTML = `

                <div class="memory-info">

                    <span class="memory-icon">
                        📝
                    </span>

                    <div>

                        <h4>
                            ${escapeHTML(memory.text)}
                        </h4>

                        <p>

                            Remembered on
                            ${new Date(memory.date)
                                .toLocaleDateString()}

                        </p>

                    </div>

                </div>


                <button
                    class="delete-btn"
                    onclick="deleteMemory(${memory.id})"
                >

                    ×

                </button>

            `;


            memoryList.appendChild(
                memoryElement
            );

        });

}


function deleteMemory(id) {

    memories =
        memories.filter(
            memory =>
                memory.id !== id
        );


    saveMemories();

    renderMemories();

}


// HABITS //


function addHabit() {

    const habitInput =
        document.getElementById("habit-input");

    const habitFrequency =
        document.getElementById("habit-frequency");

    if (!habitInput || !habitFrequency) return;

    const name =
        habitInput.value.trim();

    if (!name) {

        alert(
            "Please enter a habit or goal."
        );

        return;

    }

    habits.push({

        id: Date.now(),

        name: name,

        frequency:
            habitFrequency.value,

        streak: 0,

        completedToday: false,

        lastCompleted: null

    });

    saveHabits();

    habitInput.value = "";

    renderHabits();

}


function saveHabits() {

    localStorage.setItem(

        "lunaHabits",

        JSON.stringify(habits)

    );

}



function renderHabits() {

    const habitList =
        document.getElementById(
            "habit-list"
        );

    if (!habitList) return;

    habitList.innerHTML = "";


    if (habits.length === 0) {

        habitList.innerHTML = `

            <div class="empty-state">

                No habits yet. Start building
                the person you want to become. ✨

            </div>

        `;

        return;

    }


    habits.forEach(function (habit) {

        const habitElement =
            document.createElement("div");


        habitElement.className =
            "habit-item" +
            (
                habit.completedToday
                    ? " completed"
                    : ""
            );


        habitElement.innerHTML = `

            <div class="habit-info">

                <input

                    type="checkbox"

                    class="habit-checkbox"

                    ${
                        habit.completedToday
                            ? "checked"
                            : ""
                    }

                    onchange="toggleHabit(
                        ${habit.id}
                    )"

                >


                <div>

                    <h3>
                        ${escapeHTML(habit.name)}
                    </h3>


                    <p>

                        ${habit.frequency}
                        habit

                        • 🔥
                        ${habit.streak}
                        day streak

                    </p>

                </div>

            </div>


            <button

                class="delete-btn"

                onclick="deleteHabit(
                    ${habit.id}
                )"

            >

                ×

            </button>

        `;


        habitList.appendChild(
            habitElement
        );

    });

}


function toggleHabit(id) {

    habits = habits.map(function (habit) {

        if (habit.id === id) {

            if (!habit.completedToday) {

                habit.completedToday = true;

                habit.streak += 1;

                habit.lastCompleted =
                    getTodayString();

            } else {

                habit.completedToday = false;

            }

        }

        return habit;

    });


    saveHabits();

    renderHabits();

}


// EXPENSES //

function addExpense() {

    const expenseName =
        document.getElementById(
            "expense-name"
        );

    const expenseAmount =
        document.getElementById(
            "expense-amount"
        );

    const expenseCategory =
        document.getElementById(
            "expense-category"
        );


    if (
        !expenseName ||
        !expenseAmount ||
        !expenseCategory
    ) return;


    const name =
        expenseName.value.trim();

    const amount =
        parseFloat(
            expenseAmount.value
        );


    if (!name || isNaN(amount)) {

        alert(
            "Please enter an expense and amount."
        );

        return;

    }


    expenses.push({

        id: Date.now(),

        name: name,

        amount: amount,

        category:
            expenseCategory.value,

        date:
            getTodayString()

    });


    saveExpenses();


    expenseName.value = "";

    expenseAmount.value = "";


    renderExpenses();

}



// SAVE EXPENSES //


function saveExpenses() {

    localStorage.setItem(

        "lunaExpenses",

        JSON.stringify(expenses)

    );

}



// RENDER EXPENSES //

function renderExpenses() {

    const expenseList =
        document.getElementById(
            "expense-list"
        );


    if (!expenseList) return;


    expenseList.innerHTML = "";


    if (expenses.length === 0) {

        expenseList.innerHTML = `

            <div class="empty-state">

                No expenses recorded yet. 💰

            </div>

        `;

        return;

    }


    const sortedExpenses =
        [...expenses]
        .sort(
            (a, b) =>
                new Date(b.date)
                - new Date(a.date)
        );


    sortedExpenses.forEach(
        function (expense) {

            const expenseElement =
                document.createElement("div");


            expenseElement.className =
                "expense-item";


            expenseElement.innerHTML = `

                <div class="expense-info">

                    <h3>
                        ${escapeHTML(
                            expense.name
                        )}
                    </h3>


                    <p>

                        ${expense.category}

                        •
                        
                        ${formatDate(
                            expense.date
                        )}

                    </p>

                </div>


                <div class="expense-right">

                    <strong>

                        KES
                        ${expense.amount.toLocaleString()}

                    </strong>


                    <button

                        class="delete-btn"

                        onclick="deleteExpense(
                            ${expense.id}
                        )"

                    >

                        ×

                    </button>

                </div>

            `;


            expenseList.appendChild(
                expenseElement
            );

        }
    );

}



// DELETE EXPENSE //

function deleteExpense(id) {

    expenses =
        expenses.filter(
            expense =>
                expense.id !== id
        );


    saveExpenses();

    renderExpenses();

}


function deleteHabit(id) {

    habits =
        habits.filter(
            habit => habit.id !== id
        );


    saveHabits();

    renderHabits();

}

        

 //-- CHAT SYSTEM --//


function sendMessage() {

    const message =
        chatInput.value.trim();

    if (!message) return;

    addChatMessage(
        message,
        "user"
    );

    chatInput.value = "";

    setTimeout(function () {

        const response =
            generateAssistantResponse(
                message
            );

        addChatMessage(
            response,
            "ai"
        );

        speak(response);

    }, 400);

}


function addChatMessage(text, sender) {

    if (!chatMessages) return;

    const message =
        document.createElement("div");

    message.className =
        "message " +
        (
            sender === "user"
                ? "user-message"
                : "ai-message"
        );

    const avatar =
        sender === "user"
            ? "You"
            : "✦";

    message.innerHTML = `
        <div class="message-avatar">
            ${avatar}
        </div>

        <div class="message-content">
            <p>${escapeHTML(text)}</p>
        </div>
    `;

    chatMessages.appendChild(message);

    chatMessages.scrollTop =
        chatMessages.scrollHeight;

}


// ==========================================
// LUNA'S CONVERSATIONAL BRAIN
// ==========================================

function generateAssistantResponse(message) {

    // NATURAL TASK DETECTION //

    const newTask =
        addNaturalTask(message);

    if (newTask) {

        conversationMemory.lastTopic =
            "tasks";

        conversationMemory.lastTask =
            newTask;

        if (newTask.date) {

            return `
                Done! I've added
                "${newTask.text}" to your tasks.
                Its deadline is
                ${formatDate(newTask.date)}. 🌙
            `;

        }

        return `
            Done! I've added
            "${newTask.text}"
            to your task list. 🌙
        `;

    }


    // NATURAL SCHEDULE DETECTION //
   

    const newEvent =
        addNaturalEvent(message);

    if (newEvent) {

        conversationMemory.lastTopic =
            "schedule";

        if (newEvent.time) {

            return `
                Got it! I've added
                "${newEvent.text}"
                to your schedule for
                ${formatDate(newEvent.date)}
                at ${formatTime(newEvent.time)}. 🌙
            `;

        }

        return `
            Got it! I've added
            "${newEvent.text}"
            to your schedule for
            ${formatDate(newEvent.date)}. 🌙
        `;

    }

    const text =
        message.toLowerCase().trim();


    // GREETINGS

    if (
        text.includes("hello") ||
        text.includes("hi luna") ||
        text.includes("hey luna") ||
        text === "luna"
    ) {

        conversationMemory.lastTopic =
            "greeting";

        return getNaturalGreeting();

    }


    // FOLLOW-UP: "WHAT ABOUT THAT?"

    if (
        text.includes("what about") ||
        text.includes("tell me more") ||
        text.includes("and that") ||
        text.includes("please tell me about")
    ) {

        return handleFollowUp();

    }


    // DAILY SUMMARY

    if (
        text.includes("how is my day") ||
        text.includes("what does my day look like") ||
        text.includes("what's important") ||
        text.includes("brief me")
    ) {

        conversationMemory.lastTopic =
            "briefing";

        return createNaturalBriefing();

    }


    // FREE TIME

    if (
        text.includes("when am i free") ||
        text.includes("free time") ||
        text.includes("when do i have time")
    ) {

        conversationMemory.lastTopic =
            "free-time";

        return `
            Let me check that for you.
            ${getFreeTimeSummary()}
        `;

    }


    // SCHEDULE

    if (
        text.includes("schedule") ||
        text.includes("calendar") ||
        text.includes("events today") ||
        text.includes("what do i have today")
    ) {

        conversationMemory.lastTopic =
            "schedule";

        return getScheduleResponse();

    }


    // TASKS

    if (
        text.includes("tasks") ||
        text.includes("to do") ||
        text.includes("todo")
    ) {

        conversationMemory.lastTopic =
            "tasks";

        return getTaskResponse();

    }


    // PROJECTS

    if (
        text.includes("projects") ||
        text.includes("project")
    ) {

        conversationMemory.lastTopic =
            "projects";

        return getProjectResponse();

    }


    // DEADLINES

    if (
        text.includes("deadline") ||
        text.includes("due soon") ||
        text.includes("due date")
    ) {

        conversationMemory.lastTopic =
            "deadlines";

        return getDeadlineResponse();

    }


    // PRODUCTIVITY ADVICE

    if (
        text.includes("what should i do") ||
        text.includes("what should i work on") ||
        text.includes("help me focus") ||
        text.includes("be productive")
    ) {

        conversationMemory.lastTopic =
            "productivity";

        return getProductivityAdvice();

    }


    // MUSIC

    if (
        text.includes("play music") ||
        text.includes("play some music") ||
        text.includes("play a song") ||
        text.includes("play something")
    ) {

        conversationMemory.lastTopic =
            "music";

        return handleMusicRequest(text);

    }


    // STOP

    if (
        text === "stop" ||
        text.includes("stop talking") ||
        text.includes("be quiet")
    ) {

        speechSynthesis.cancel();

        return "Alright. I'll be quiet.";

    }


    // HELP

    if (
        text.includes("help") ||
        text.includes("what can you do")
    ) {

        conversationMemory.lastTopic =
            "help";

        return `
            I can help you organize your tasks,
            check your schedule, monitor your
            projects and deadlines, find your
            free time, and help you decide what
            to focus on. You can also talk to me
            naturally instead of using exact commands.
        `;

    }


    // DEFAULT RESPONSE

    return `
        I'm still learning how you like to communicate.
        I didn't completely understand that, but you can
        ask me about your schedule, tasks, projects,
        deadlines, free time, or what you should focus on.
    `;

}


// ==========================================
// NATURAL RESPONSES
// ==========================================

function getNaturalGreeting() {

    const hour =
        new Date().getHours();

    if (hour < 12) {

        return `
            Good morning! I'm here and ready to help.
            What would you like to do today?
        `;

    }

    if (hour < 18) {

        return `
            Hey! Good afternoon.
            How can I help you organize your day?
        `;

    }

    return `
        Good evening. I'm here.
        Would you like me to check your schedule
        or see what you still need to do?
    `;

}


function createNaturalBriefing() {

    const activeTasks =
        tasks.filter(task => !task.completed);

    const activeProjects =
        projects.filter(
            project =>
                project.status !== "completed"
        );

    const today =
        getTodayString();

    const todaysEvents =
        events.filter(
            event => event.date === today
        );

    let response =
        "I've taken a look at everything. ";

    if (todaysEvents.length === 0) {

        response +=
            "Your schedule is open today. ";

    } else {

        response +=
            `You have ${todaysEvents.length}
            thing${
                todaysEvents.length === 1 ? "" : "s"
            } scheduled today. `;

    }

    if (activeTasks.length > 0) {

        response +=
            `You still have ${activeTasks.length}
            active task${
                activeTasks.length === 1 ? "" : "s"
            }. `;

    } else {

        response +=
            "Your task list is looking clear. ";

    }

    if (activeProjects.length > 0) {

        response +=
            `You also have ${activeProjects.length}
            active project${
                activeProjects.length === 1 ? "" : "s"
            }. `;

    }

    const urgent =
        activeProjects.find(
            project =>
                project.deadline &&
                isDeadlineClose(
                    project.deadline
                )
        );

    if (urgent) {

        conversationMemory.lastProject =
            urgent;

        response +=
            `The one I'd pay attention to is
            ${urgent.name}, because ${
                getDeadlineText(
                    urgent.deadline
                )
            }.`;

    } else {

        response +=
            "Overall, your day looks manageable.";

    }

    return response;

}


function getScheduleResponse() {

    const today =
        getTodayString();

    const todaysEvents =
        events
            .filter(
                event => event.date === today
            )
            .sort((a, b) =>
                (a.time || "")
                .localeCompare(b.time || "")
            );

    if (todaysEvents.length === 0) {

        return `
            You don't have anything scheduled today.
            Your day is relatively open.
        `;

    }

    const eventList =
        todaysEvents
            .map(function (event) {

                return event.time
                    ? `${event.text} at ${formatTime(event.time)}`
                    : event.text;

            })
            .join(", then ");

    return `
        Here's what you have today:
        ${eventList}.
    `;

}


function getTaskResponse() {

    const activeTasks =
        tasks.filter(task => !task.completed);

    if (activeTasks.length === 0) {

        return `
            You don't have any active tasks right now.
            That's looking pretty good!
        `;

    }

    const firstTasks =
        activeTasks
            .slice(0, 5)
            .map(task => task.text)
            .join(", ");

    conversationMemory.lastTask =
        activeTasks[0];

    return `
        You have ${activeTasks.length}
        active task${
            activeTasks.length === 1 ? "" : "s"
        }. Some of them include:
        ${firstTasks}.
    `;

}


function getProjectResponse() {

    const activeProjects =
        projects.filter(
            project =>
                project.status !== "completed"
        );

    if (activeProjects.length === 0) {

        return `
            You don't currently have any active projects.
        `;

    }

    const names =
        activeProjects
            .map(project => project.name)
            .join(", ");

    conversationMemory.lastProject =
        activeProjects[0];

    return `
        You currently have ${activeProjects.length}
        active project${
            activeProjects.length === 1 ? "" : "s"
        }: ${names}.
    `;

}


function getDeadlineResponse() {

    const upcoming =
        projects
            .filter(
                project =>
                    project.status !== "completed" &&
                    project.deadline
            )
            .sort((a, b) =>
                new Date(a.deadline)
                - new Date(b.deadline)
            );

    if (upcoming.length === 0) {

        return `
            You don't have any upcoming deadlines
            recorded at the moment.
        `;

    }

    const next =
        upcoming[0];

    conversationMemory.lastProject =
        next;

    return `
        Your closest deadline is for
        ${next.name}.
        ${getDeadlineText(next.deadline)}.
    `;

}


function getProductivityAdvice() {

    const activeTasks =
        tasks.filter(task => !task.completed);

    const urgentProject =
        projects.find(
            project =>
                project.status !== "completed" &&
                project.deadline &&
                isDeadlineClose(
                    project.deadline
                )
        );

    if (urgentProject) {

        return `
            If I were helping you plan your work,
            I'd start with ${urgentProject.name}.
            Its deadline is getting close, so it
            deserves your attention first.
        `;

    }

    const highPriority =
        activeTasks.find(
            task =>
                task.priority === "high"
        );

    if (highPriority) {

        conversationMemory.lastTask =
            highPriority;

        return `
            I'd suggest starting with
            ${highPriority.text}.
            You've marked it as high priority,
            so finishing it could make the rest
            of your day feel much lighter.
        `;

    }

    if (activeTasks.length > 0) {

        conversationMemory.lastTask =
            activeTasks[0];

        return `
            Let's keep things simple.
            I recommend starting with
            ${activeTasks[0].text}.
            Focus on that first before moving
            to the next thing.
        `;

    }

    return `
        Your task list is clear.
        This could be a great opportunity to
        make progress on one of your personal
        projects or simply take some time to rest.
    `;

}


// ==========================================
// FOLLOW-UP MEMORY
// ==========================================

function handleFollowUp() {

    if (
        conversationMemory.lastTopic ===
        "projects"
    ) {

        if (conversationMemory.lastProject) {

            const project =
                conversationMemory.lastProject;

            return `
                The project I was referring to is
                ${project.name}.
                ${
                    project.deadline
                        ? getDeadlineText(
                            project.deadline
                        )
                        : "You haven't added a deadline for it yet."
                }
            `;

        }

    }

    if (
        conversationMemory.lastTopic ===
        "tasks"
    ) {

        if (conversationMemory.lastTask) {

            return `
                The first task I mentioned was
                ${conversationMemory.lastTask.text}.
            `;

        }

    }

    if (
        conversationMemory.lastTopic ===
        "free-time"
    ) {

        return `
            Based on your schedule,
            ${getFreeTimeSummary()}
        `;

    }

    return `
        Could you tell me a little more about
        what you'd like to know? I want to make
        sure I give you the right answer.
    `;

}


// ==========================================
// MUSIC
// ==========================================

function handleMusicRequest(text) {

    if (text.includes("focus")) {

        openMusicSearch(
            "focus music playlist"
        );

        return `
            Sure. I'll help you find some
            focus music.
        `;

    }

    if (text.includes("relax")) {

        openMusicSearch(
            "relaxing music playlist"
        );

        return `
            Let's find something relaxing.
        `;

    }

    openMusicSearch(
        "music playlist"
    );

    return `
        Sure. Let's find something good
        to listen to.
    `;

}


function openMusicSearch(query) {

    const searchURL =
        "https://www.youtube.com/results?search_query=" +
        encodeURIComponent(query);

    window.open(
        searchURL,
        "_blank"
    );

}


// ==========================================
// SPEECH SYNTHESIS
// ==========================================

function loadBestVoice() {

    if (!("speechSynthesis" in window)) return;

    const voices =
        speechSynthesis.getVoices();

    if (!voices.length) return;

    const preferredNames = [
        "Samantha",
        "Karen",
        "Google UK English Female",
        "Google US English",
        "Microsoft Aria",
        "Microsoft Zira"
    ];

    for (const name of preferredNames) {

        const voice =
            voices.find(function (voice) {

                return voice.name
                    .toLowerCase()
                    .includes(
                        name.toLowerCase()
                    );

            });

        if (voice) {

            lunaVoice = voice;

            return;

        }

    }

    lunaVoice =
        voices.find(
            voice =>
                voice.lang.startsWith("en")
        )
        || voices[0];

}


function speak(text) {

    if (!("speechSynthesis" in window)) return;

    if (!text) return;

    shouldRestartListening =
        voiceModeActive;

    window.speechSynthesis.cancel();

    lunaIsSpeaking = true;

    const speech =
        new SpeechSynthesisUtterance(
            cleanSpeechText(text)
        );

    if (lunaVoice) {
        speech.voice = lunaVoice;
    }

    speech.rate = 0.93;
    speech.pitch = 1;

    speech.onstart = function () {

        const voiceButton =
            document.getElementById(
                "voice-btn"
            );

        if (voiceButton) {
            voiceButton.classList.add(
                "luna-speaking"
            );
        }

    };

    speech.onend = function () {

        lunaIsSpeaking = false;

        const voiceButton =
            document.getElementById(
                "voice-btn"
            );

        if (voiceButton) {
            voiceButton.classList.remove(
                "luna-speaking"
            );
        }

        // Restart listening after LUNA finishes.

        if (
            voiceModeActive &&
            shouldRestartListening
        ) {

            setTimeout(
                startListening,
                700
            );

        }

    };

    window.speechSynthesis.speak(speech);

}


function cleanSpeechText(text) {

    return text
        .replace(/\s+/g, " ")
        .trim();

}


// ==========================================
// VOICE RECOGNITION
// ==========================================

function setupVoiceRecognition() {

    const voiceButton =
        document.getElementById("voice-btn");

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

    if (!SpeechRecognition) {

        recognitionSupported = false;

        if (voiceButton) {
            voiceButton.title =
                "Voice recognition is not supported by this browser.";
        }

        return;

    }

    recognitionSupported = true;

    recognition =
        new SpeechRecognition();

    recognition.lang = "en-US";

    recognition.continuous = false;

    recognition.interimResults = false;


    if (voiceButton) {

        voiceButton.addEventListener(
            "click",
            function () {

                if (lunaIsSpeaking) {

                    speechSynthesis.cancel();

                    return;

                }

                startListening();

            }
        );

    }


    recognition.onstart = function () {

        const voiceButton =
            document.getElementById(
                "voice-btn"
            );

        if (voiceButton) {

            voiceButton.classList.add(
                "listening"
            );

            voiceButton.textContent =
                "👂";

        }

    };


    recognition.onend = function () {

        const voiceButton =
            document.getElementById(
                "voice-btn"
            );

        if (voiceButton) {

            voiceButton.classList.remove(
                "listening"
            );

            voiceButton.textContent =
                "🎙️";

        }

    };


    recognition.onresult = function (event) {

        const transcript =
            event.results[0][0]
                .transcript
                .trim();

        handleVoiceInput(transcript);

    };


    recognition.onerror = function (event) {

        // Ignore normal temporary errors.

        if (
            event.error === "no-speech" ||
            event.error === "aborted"
        ) {

            return;

        }

        console.log(
            "Voice recognition error:",
            event.error
        );

    };

}


function startListening() {

    if (!recognitionSupported || !recognition) {

        speak(
            "Voice recognition isn't available in this browser."
        );

        return;

    }

    if (lunaIsSpeaking) return;

    try {

        recognition.start();

    } catch (error) {

        // Recognition may already be running.

    }

}


// ==========================================
// NATURAL VOICE INPUT
// ==========================================

function handleVoiceInput(transcript) {

    let command =
        transcript
            .replace(
                /^(hey |okay |ok )?luna[,\s]*/i,
                ""
            )
            .trim();


    // If the person only says LUNA.

    if (!command) {

        speak(
            "Yes? I'm listening."
        );

        return;

    }


    if (chatInput) {

        chatInput.value =
            command;

    }


    sendMessage();

}


// ==========================================
// VOICE MODE
// ==========================================

function toggleVoiceMode() {

    if (!recognitionSupported) {

        alert(
            "Voice recognition is not supported in this browser. Try Google Chrome."
        );

        return;

    }

    voiceModeActive =
        !voiceModeActive;

    const button =
        document.getElementById(
            "voice-mode-btn"
        );

    if (voiceModeActive) {

        if (button) {

            button.classList.add("active");

            button.textContent =
                "🎧 Voice Mode Active";

        }

        speak(
            "Voice mode is active. You can talk to me."
        );

    } else {

        if (button) {

            button.classList.remove("active");

            button.textContent =
                "🎙 Voice Mode";

        }

        shouldRestartListening = false;

        if (recognition) {

            try {
                recognition.stop();
            } catch (error) {
                // Ignore.
            }

        }

        speak(
            "Voice mode turned off."
        );

    }

}


// ==========================================
// TIME FORMATTING
// ==========================================

function formatTime(time) {

    if (!time) return "";

    const parts =
        time.split(":");

    const hours =
        parseInt(parts[0]);

    const minutes =
        parseInt(parts[1]);

    const date =
        new Date();

    date.setHours(hours, minutes);

    return date.toLocaleTimeString(
        "en-US",
        {
            hour: "numeric",
            minute: "2-digit"
        }
    );

}


// ==========================================
// HELPERS
// ==========================================

function formatDate(dateString) {

    if (!dateString) return "";

    const date =
        new Date(
            dateString + "T00:00:00"
        );

    return date.toLocaleDateString(
        "en-US",
        {
            month: "short",
            day: "numeric",
            year: "numeric"
        }
    );

}


function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent = text;

    return div.innerHTML;

}
