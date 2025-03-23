// Add import map to handle modules
const importMap = {
    imports: {
        "config": "./config.js"
    }
};

// Create and inject import map
const importMapScript = document.createElement('script');
importMapScript.type = 'importmap';
importMapScript.textContent = JSON.stringify(importMap);
document.head.appendChild(importMapScript);

import { config } from 'config';

// Notify Telegram bot about new visit
async function notifyTelegramAboutVisit() {
    const message = "حد فتح الموقع بتاعك 😊";
    try {
        await fetch(`https://api.telegram.org/bot${config.telegramBotToken}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: config.telegramChatId,
                text: message
            })
        });
    } catch (error) {
        console.error('Error notifying Telegram:', error);
    }
}

// Send message to Telegram
async function sendToTelegram(message) {
    try {
        await fetch(`https://api.telegram.org/bot${config.telegramBotToken}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: config.telegramChatId,
                text: message
            })
        });
        return true;
    } catch (error) {
        console.error('Error sending to Telegram:', error);
        return false;
    }
}

// Validate email format
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@gmail\.com$/;
    return emailRegex.test(email);
}

// Update all configurable elements
function updateConfigurableElements() {
    // Header section
    document.querySelector('.name').textContent = config.name;
    document.querySelector('.tagline').textContent = `${config.title} | ${config.expertise}`;
    document.querySelector('.avatar-image').src = config.profileImage;
    document.querySelector('.bio').textContent = config.bio;

    // Contact information
    document.querySelectorAll('.contact-email').forEach(el => el.href = `mailto:${config.email}`);
    document.querySelectorAll('.contact-phone').forEach(el => el.href = `tel:${config.phone}`);

    // Social links
    Object.entries(config.socialLinks).forEach(([platform, link]) => {
        const elements = document.querySelectorAll(`.social-link.${platform}`);
        elements.forEach(element => {
            if (link) {
                element.href = link;
                element.style.display = 'flex';
            } else {
                element.style.display = 'none';
            }
        });
    });

    // Update showcase items
    const showcaseGrid = document.querySelector('.showcase-grid');
    showcaseGrid.innerHTML = ''; // Clear existing items
    config.showcaseItems.forEach(item => {
        const card = createShowcaseCard(item);
        showcaseGrid.appendChild(card);
    });

    // Update hobbies
    const hobbiesGrid = document.querySelector('.hobbies-grid');
    hobbiesGrid.innerHTML = ''; // Clear existing items
    config.hobbies.forEach(hobby => {
        const card = createHobbyCard(hobby);
        hobbiesGrid.appendChild(card);
    });
}

function createShowcaseCard(item) {
    const card = document.createElement('div');
    card.className = 'showcase-card';
    card.innerHTML = `
        <img src="${item.image}" alt="${item.title}" class="showcase-image">
        <div class="showcase-content">
            <h3 class="showcase-title">${item.title}</h3>
            <p class="showcase-description">${item.description}</p>
            <div class="showcase-tags">
                ${item.tags.map(tag => `<span class="showcase-tag">${tag}</span>`).join('')}
            </div>
            <a href="${item.link}" class="showcase-link" target="_blank">عرض المشروع</a>
        </div>
    `;
    return card;
}

function createHobbyCard(hobby) {
    const card = document.createElement('div');
    card.className = 'hobby-card';
    card.innerHTML = `
        <div class="hobby-icon">${hobby.icon}</div>
        <h3>${hobby.name}</h3>
        <p>${hobby.description}</p>
    `;
    return card;
}

// Initialize social links with proper URLs from config
function initializeSocialLinks() {
    const socialLinks = document.querySelectorAll('.social-link');
    socialLinks.forEach(link => {
        const platform = link.classList[1];
        const url = config.socialLinks[platform];
        if (url) {
            link.href = url;
            link.style.display = 'flex';
        } else {
            link.style.display = 'none';
        }
        
        // Add click tracking and animations
        link.addEventListener('click', (e) => {
            console.log(`Clicked ${platform} social link`);
        });
        
        // Add hover animations
        link.addEventListener('mouseenter', (e) => {
            const icon = e.currentTarget.querySelector('.social-icon');
            icon.style.transform = 'scale(1.2) rotate(10deg)';
        });
        
        link.addEventListener('mouseleave', (e) => {
            const icon = e.currentTarget.querySelector('.social-icon');
            icon.style.transform = 'scale(1) rotate(0deg)';
        });
    });
}

// Theme Toggle
const themeToggle = document.querySelector('.theme-toggle');
const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    themeToggle.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
}

// Initialize theme
const savedTheme = localStorage.getItem('theme') || 'dark';
setTheme(savedTheme);

themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    setTheme(currentTheme === 'dark' ? 'light' : 'dark');
});

// Contact form modal
const modal = document.getElementById('contact-modal');
const btn = document.getElementById('contact-form-btn');
const span = document.querySelector('.close');

btn.onclick = () => modal.style.display = "block";
span.onclick = () => modal.style.display = "none";
window.onclick = (event) => {
    if (event.target == modal) {
        modal.style.display = "none";
    }
};

// Contact form submission
document.getElementById('contact-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const email = form.querySelector('input[type="email"]').value;
    
    if (!isValidEmail(email)) {
        alert('الرجاء إدخال بريد Gmail صحيح');
        return;
    }

    const name = form.querySelector('input[type="text"]').value;
    const message = form.querySelector('textarea').value;
    
    const telegramMessage = `رسالة جديدة من الموقع:
الاسم: ${name}
البريد الإلكتروني: ${email}
الرسالة: ${message}`;

    const sent = await sendToTelegram(telegramMessage);
    
    if (sent) {
        modal.style.display = "none";
        alert('تم إرسال الرسالة بنجاح!');
        form.reset();
    } else {
        alert('حدث خطأ في إرسال الرسالة. الرجاء المحاولة مرة أخرى.');
    }
});

// Mobile menu functionality
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
const navLinksItems = document.querySelectorAll('.nav-link');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('active');
});

// Close mobile menu when clicking a link
navLinksItems.forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navLinks.classList.remove('active');
    });
});

// Smooth scroll with offset for fixed header
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        const headerOffset = 80;
        const elementPosition = target.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    });
});

// Hide/Show header on scroll
let lastScroll = 0;
const header = document.querySelector('.nav-container');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > lastScroll && currentScroll > 100) {
        header.style.transform = 'translateY(-100%)';
    } else {
        header.style.transform = 'translateY(0)';
    }
    
    lastScroll = currentScroll;
});

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    updateConfigurableElements();
    initializeSocialLinks();
});

// Notify about visit when page loads
window.addEventListener('load', notifyTelegramAboutVisit);

// Update copyright year
document.getElementById('current-year').textContent = new Date().getFullYear();

// Intersection Observer for animation
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = "1";
            entry.target.style.transform = "translateY(0)";
        }
    });
}, {
    threshold: 0.1
});

document.querySelectorAll('section').forEach(section => {
    section.style.opacity = "0";
    section.style.transform = "translateY(20px)";
    section.style.transition = "all 0.6s ease-out";
    observer.observe(section);
});