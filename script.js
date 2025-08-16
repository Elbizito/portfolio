// Loading 
window.addEventListener('load', () => {
    setTimeout(() => {
        document.getElementById('loading').style.opacity = '0';
        setTimeout(() => {
            document.getElementById('loading').style.display = 'none';
        }, 500);
    }, 1000);
});

// Custom Cursor 
const cursor = document.querySelector('.cursor');
let isMoving = false;

// Verificar se é dispositivo móvel
const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

if (!isTouchDevice) {
    document.addEventListener('mousemove', (e) => {
        if (cursor) {
            cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
            cursor.style.opacity = '1';
            cursor.style.visibility = 'visible';
        }
    });

    // Elementos que ativam o hover do cursor
    const hoverElements = document.querySelectorAll('a, button, .skill-card, input, textarea');
    
    hoverElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            if (cursor) cursor.classList.add('hover');
        });
        el.addEventListener('mouseleave', () => {
            if (cursor) cursor.classList.remove('hover');
        });
    });

    // Esconder cursor quando sair da tela
    document.addEventListener('mouseleave', () => {
        if (cursor) cursor.style.opacity = '0';
    });

    document.addEventListener('mouseenter', () => {
        if (cursor) cursor.style.opacity = '1';
    });
} else {
    // Esconder cursor em dispositivos móveis
    if (cursor) cursor.style.display = 'none';
}

// Mobile Sidebar 
const mobileToggle = document.getElementById('mobileToggle');
const sidebar = document.getElementById('sidebar');

mobileToggle.addEventListener('click', () => {
    sidebar.classList.toggle('active');
    mobileToggle.classList.toggle('active');
});

// Fechar sidebar ao clicar em link (mobile)
document.querySelectorAll('.sidebar-menu a').forEach(link => {
    link.addEventListener('click', () => {
        if (window.innerWidth <= 1024) {
            sidebar.classList.remove('active');
            mobileToggle.classList.remove('active');
        }
    });
});

// Skills Carousel 
class SkillsCarousel {
    constructor() {
        this.carousel = document.getElementById('skillsCarousel');
        this.cards = document.querySelectorAll('.skill-card');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        this.indicators = document.getElementById('carouselIndicators');
        
        this.currentIndex = 0;
        this.cardsPerView = this.getCardsPerView();
        this.maxIndex = Math.max(0, this.cards.length - this.cardsPerView);
        
        this.init();
    }
    
    getCardsPerView() {
        const width = window.innerWidth;
        if (width <= 480) return 1;
        if (width <= 768) return 2;
        if (width <= 1024) return 2;
        return 3;
    }
    
    init() {
        this.createIndicators();
        this.updateCarousel();
        this.bindEvents();
    }
    
    createIndicators() {
        this.indicators.innerHTML = '';
        for (let i = 0; i <= this.maxIndex; i++) {
            const indicator = document.createElement('div');
            indicator.className = 'indicator';
            if (i === 0) indicator.classList.add('active');
            indicator.addEventListener('click', () => this.goToSlide(i));
            this.indicators.appendChild(indicator);
        }
    }
    
    updateCarousel() {
        const cardWidth = 300;
        const gap = 32; // 2rem
        const translateX = -(this.currentIndex * (cardWidth + gap));
        
        this.carousel.style.transform = `translateX(${translateX}px)`;
        
        // Atualizar indicadores
        document.querySelectorAll('.indicator').forEach((indicator, index) => {
            indicator.classList.toggle('active', index === this.currentIndex);
        });
        
        // Atualizar botões
        this.prevBtn.disabled = this.currentIndex === 0;
        this.nextBtn.disabled = this.currentIndex >= this.maxIndex;
        
        // Efeito 3D nos cards visíveis
        this.cards.forEach((card, index) => {
            const distance = Math.abs(index - this.currentIndex - 1);
            const scale = Math.max(0.8, 1 - distance * 0.1);
            const rotateY = (index - this.currentIndex - 1) * 15;
            const translateZ = distance > 0 ? -distance * 100 : 0;
            
            card.style.transform = `
                scale(${scale}) 
                rotateY(${rotateY}deg) 
                translateZ(${translateZ}px)
            `;
            card.style.opacity = distance > 2 ? 0.3 : 1;
        });
    }
    
    prev() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            this.updateCarousel();
        }
    }
    
    next() {
        if (this.currentIndex < this.maxIndex) {
            this.currentIndex++;
            this.updateCarousel();
        }
    }
    
    goToSlide(index) {
        this.currentIndex = Math.max(0, Math.min(index, this.maxIndex));
        this.updateCarousel();
    }
    
    bindEvents() {
        this.prevBtn.addEventListener('click', () => this.prev());
        this.nextBtn.addEventListener('click', () => this.next());
        
        // Swipe em dispositivos móveis
        let startX = 0;
        let isDragging = false;
        
        this.carousel.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            isDragging = true;
        });
        
        this.carousel.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            e.preventDefault();
        });
        
        this.carousel.addEventListener('touchend', (e) => {
            if (!isDragging) return;
            isDragging = false;
            
            const endX = e.changedTouches[0].clientX;
            const diff = startX - endX;
            
            if (Math.abs(diff) > 50) {
                if (diff > 0) {
                    this.next();
                } else {
                    this.prev();
                }
            }
        });
        
        // Navegação por teclado
        document.addEventListener('keydown', (e) => {
            if (this.isInView()) {
                if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    this.prev();
                } else if (e.key === 'ArrowRight') {
                    e.preventDefault();
                    this.next();
                }
            }
        });
    }
    
    isInView() {
        const rect = this.carousel.getBoundingClientRect();
        return rect.top < window.innerHeight && rect.bottom > 0;
    }
    
    startAutoPlay() {
        setInterval(() => {
            if (!this.isInView()) return;
            
            if (this.currentIndex >= this.maxIndex) {
                this.currentIndex = 0;
            } else {
                this.currentIndex++;
            }
            this.updateCarousel();
        }, 5000);
    }
    
    handleResize() {
        this.cardsPerView = this.getCardsPerView();
        this.maxIndex = Math.max(0, this.cards.length - this.cardsPerView);
        this.currentIndex = Math.min(this.currentIndex, this.maxIndex);
        this.createIndicators();
        this.updateCarousel();
    }
}

// Inicializar carousel quando as skills estiverem carregadas
let skillsCarousel;

// Smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Parallax effect para elementos flutuantes
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const rate = scrolled * -0.3;
    
    document.querySelectorAll('.floating-element').forEach((el, index) => {
        const speed = (index + 1) * 0.5;
        el.style.transform = `translateY(${rate * speed}px) rotate(${scrolled * 0.1}deg)`;
    });
});

// Intersection Observer para animações
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            
            // Inicializar carousel quando a seção de skills aparecer
            if (entry.target.classList.contains('skills') && !skillsCarousel) {
                skillsCarousel = new SkillsCarousel();
            }
        }
    });
}, observerOptions);

// Observar seções para animações de entrada
document.querySelectorAll('section').forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(50px)';
    section.style.transition = 'all 0.6s ease';
    observer.observe(section);
});

// Hero sempre visível
document.querySelector('.hero').style.opacity = '1';
document.querySelector('.hero').style.transform = 'translateY(0)';

// Interação com skill cards
document.querySelectorAll('.skill-card').forEach(card => {
    card.addEventListener('click', () => {
        card.querySelector('.skill-card-inner').style.transform = 
            card.querySelector('.skill-card-inner').style.transform.includes('180deg') ? 
            'rotateY(0deg)' : 'rotateY(180deg)';
    });
});


// Redimensionamento responsivo
window.addEventListener('resize', () => {
    if (skillsCarousel) {
        skillsCarousel.handleResize();
    }
    
    // Fechar sidebar no desktop
    if (window.innerWidth > 1024) {
        sidebar.classList.remove('active');
        mobileToggle.classList.remove('active');
    }
});

// Sidebar ativa no link atual
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.sidebar-menu a');
    
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.getBoundingClientRect().top;
        if (sectionTop <= 100) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// Melhorar performance em dispositivos móveis
if (isTouchDevice) {
    // Reduzir animações em dispositivos móveis
    document.documentElement.style.setProperty('--animation-duration', '0.3s');
    
    // Otimizar scroll
    let ticking = false;
    
    function updateAnimations() {
        // Apenas animações essenciais no mobile
        ticking = false;
    }
    
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(updateAnimations);
            ticking = true;
        }
    });
}

// Preload de imagens
function preloadImages() {
    const imageUrls = [
        // imgs
    ];
    
    imageUrls.forEach(url => {
        const img = new Image();
        img.src = url;
    });
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    preloadImages();
    
    // Adicionar classes de animação após o carregamento
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 100);
});

// Tratamento de erros
window.addEventListener('error', (e) => {
    console.error('Erro na aplicação:', e.error);
});

// projetos 
// ===== PROJETOS PAGE FUNCTIONALITY =====

document.addEventListener('DOMContentLoaded', function() {
    const projetoItems = document.querySelectorAll('.projeto-item');

    if (projetoItems.length > 0) {
        // Click handler para abrir GitHub
        projetoItems.forEach(item => {
            item.addEventListener('click', function() {
                const githubUrl = this.getAttribute('data-github');
                if (githubUrl) {
                    window.open(githubUrl, '_blank');
                }
            });
        });
    }
});