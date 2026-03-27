import { useState, useEffect, useRef, useCallback, useDeferredValue } from 'react';
import { motion, useSpring, useInView, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck, Clock, Video, BadgeCheck,
  Send, ChevronDown, Star, X, Menu,
  ArrowRight, CheckSquare, Square,
  ChevronLeft, ChevronRight, Zap, Layers, Sparkles, HardHat
} from 'lucide-react';

// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────

const COMPANY_NAME = 'СМАРТ-Отделка';
const TG_LINK = 'https://t.me/SmartOtdelkaBot';

const SERVICES = [
  {
    id: 1,
    title: 'Косметический ремонт',
    price: 14000,
    priceLabel: 'от 14 000 ₽ / м²',
    description: 'Быстрое обновление интерьера: обои, ламинат, покраска.',
    backgroundImage: '/images/services/cosmetic.jpg',
    icon: Layers,
    size: 'small',
  },
  {
    id: 2,
    title: 'Черновая отделка / White Box',
    price: 18000,
    priceLabel: 'от 18 000 ₽ / м²',
    description: 'Стяжка, штукатурка, разводка коммуникаций.',
    backgroundImage: '/images/services/white-box.jpg',
    icon: HardHat,
    size: 'small',
  },
  {
    id: 3,
    title: 'Капитальный ремонт',
    price: 28000,
    priceLabel: 'от 28 000 ₽ / м²',
    description: 'Полный демонтаж, возведение перегородок, электрика, сантехника.',
    backgroundImage: '/images/services/capital.jpg',
    icon: Zap,
    size: 'large',
  },
  {
    id: 4,
    title: 'Дизайнерский ремонт',
    price: 45000,
    priceLabel: 'от 45 000 ₽ / м²',
    description: 'Премиум-класс по дизайн-проекту с авторским надзором.',
    backgroundImage: '/images/services/designer.jpg',
    icon: Sparkles,
    size: 'small',
  },
];

const ADVANTAGES = [
  {
    id: 1,
    title: 'Фиксированная смета',
    description: 'Цена не меняется в процессе. Никаких скрытых доплат.',
    icon: ShieldCheck,
  },
  {
    id: 2,
    title: 'Соблюдение сроков',
    description: 'Платим неустойку за каждый день просрочки.',
    icon: Clock,
  },
  {
    id: 3,
    title: 'Прозрачность',
    description: 'Ежедневные видеоотчеты в Telegram.',
    icon: Video,
  },
  {
    id: 4,
    title: 'Гарантия 5 лет',
    description: 'На все виды инженерных работ.',
    icon: BadgeCheck,
  },
];

const TESTIMONIALS = [
  {
    id: 1,
    name: 'Иван Смирнов',
    rating: 5,
    text: 'Заказывали капиталку в евротрешке. Сдали объект на 3 дня раньше срока. Смета не выросла ни на рубль.',
    avatar: 'ИС',
  },
  {
    id: 2,
    name: 'Елена Карпова',
    rating: 5,
    text: 'Прораб Михаил присылал видеоотчеты каждый вечер. Результат 1-в-1 как на 3D-рендерах.',
    avatar: 'ЕК',
  },
  {
    id: 3,
    name: 'Алексей Дмитриев',
    rating: 4,
    text: 'Качество черновых работ на высоте — стены выведены в идеальный ноль. Доставка чуть задержалась, но в целом супер.',
    avatar: 'АД',
  },
];

const REPAIR_TYPES = [
  { id: 'cosmetic', label: 'Косметический', price: 14000 },
  { id: 'capital', label: 'Капитальный', price: 28000 },
  { id: 'designer', label: 'Дизайнерский', price: 45000 },
];

function formatPhoneInput(value: string) {
  let digits = value.replace(/\D/g, '');

  if (!digits) return '';
  if (digits.startsWith('8')) digits = `7${digits.slice(1)}`;
  if (!digits.startsWith('7')) digits = `7${digits}`;

  digits = digits.slice(0, 11);
  const nationalPart = digits.slice(1);

  let formatted = '+7';

  if (nationalPart.length > 0) {
    formatted += ` (${nationalPart.slice(0, 3)}`;
  }
  if (nationalPart.length >= 3) {
    formatted += ')';
  }
  if (nationalPart.length > 3) {
    formatted += ` ${nationalPart.slice(3, 6)}`;
  }
  if (nationalPart.length > 6) {
    formatted += `-${nationalPart.slice(6, 8)}`;
  }
  if (nationalPart.length > 8) {
    formatted += `-${nationalPart.slice(8, 10)}`;
  }

  return formatted;
}

// ─────────────────────────────────────────────
// ANIMATED NUMBER HOOK
// ─────────────────────────────────────────────

function useAnimatedNumber(target: number) {
  const spring = useSpring(target, { stiffness: 80, damping: 20, mass: 0.5 });
  const [display, setDisplay] = useState(target);

  useEffect(() => {
    spring.set(target);
  }, [target, spring]);

  useEffect(() => {
    const unsubscribe = spring.on('change', (v) => {
      setDisplay(Math.round(v));
    });
    return unsubscribe;
  }, [spring]);

  return display;
}

// ─────────────────────────────────────────────
// FADE IN VIEW WRAPPER
// ─────────────────────────────────────────────

function FadeInView({
  children,
  delay = 0,
  className = '',
  direction = 'up',
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  direction?: 'up' | 'left' | 'right' | 'none';
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  const variants = {
    hidden: {
      opacity: 0,
      y: direction === 'up' ? 40 : 0,
      x: direction === 'left' ? -40 : direction === 'right' ? 40 : 0,
    },
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
      transition: { duration: 0.7, delay, ease: 'easeOut' as const },
    },
  };

  return (
    <motion.div
      ref={ref}
      variants={variants}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// HEADER
// ─────────────────────────────────────────────

function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { label: 'Услуги', href: '#services' },
    { label: 'Калькулятор', href: '#calculator' },
    { label: 'О нас', href: '#advantages' },
    { label: 'Отзывы', href: '#testimonials' },
  ];

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-[#0A0C10]/80 backdrop-blur-xl border-b border-white/5 shadow-2xl'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <a href="#" className="group">
            <span className="font-black text-xl sm:text-2xl text-white tracking-tight leading-none">
              СМАРТ<span className="text-[#E85D04]">-Отделка</span>
            </span>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-white/60 hover:text-white transition-colors duration-200 relative group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-[#E85D04] group-hover:w-full transition-all duration-300" />
              </a>
            ))}
          </nav>

          {/* CTA */}
          <div className="flex items-center gap-3">
            <a
              href={TG_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-2 px-4 py-2 border border-white/20 rounded-lg text-sm text-white/80 hover:border-[#E85D04] hover:text-[#E85D04] transition-all duration-300 font-medium"
            >
              <Send size={15} />
              Написать в Telegram
            </a>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 text-white/60 hover:text-white transition-colors"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden bg-[#0F1117]/95 backdrop-blur-xl border-b border-white/5 overflow-hidden"
          >
            <div className="px-4 py-4 flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-white/70 hover:text-white py-2 border-b border-white/5 transition-colors"
                >
                  {link.label}
                </a>
              ))}
              <a
                href={TG_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 border border-[#E85D04]/50 rounded-lg text-[#E85D04] font-medium text-sm justify-center mt-2"
              >
                <Send size={15} />
                Написать в Telegram
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

// ─────────────────────────────────────────────
// HERO SECTION
// ─────────────────────────────────────────────

function HeroSection() {
  const scrollToCalc = () => {
    document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-[#0A0C10]">
      {/* Background grid */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />
        {/* Radial glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full bg-[#E85D04]/5 blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-[#E85D04]/3 blur-[80px]" />
        <div className="absolute top-20 right-10 w-[300px] h-[300px] rounded-full bg-blue-500/3 blur-[80px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#E85D04]/30 bg-[#E85D04]/10 text-[#E85D04] text-sm font-medium mb-8"
        >
          <span className="w-2 h-2 rounded-full bg-[#E85D04] animate-pulse" />
          Москва и МО — принимаем заявки
        </motion.div>

        {/* Main headline */}
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-black text-white leading-[0.9] tracking-tight mb-8"
        >
          РЕМОНТ
          <br />
          <span className="text-[#E85D04]">КВАРТИР</span>
          <br />
          <span className="text-white/30">ПОД КЛЮЧ</span>
          <br />
          <span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white/50">В МОСКВЕ</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="text-lg sm:text-xl text-white/50 max-w-xl mb-12 font-light leading-relaxed"
        >
          Фиксированная смета. Видеоотчеты каждый день.
          <br />
          Гарантия 5 лет на инженерные работы.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.65 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <button
            onClick={scrollToCalc}
            className="btn-glow inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#E85D04] rounded-xl text-white font-bold text-base hover:bg-[#FF6A0F] transition-colors duration-300"
          >
            Рассчитать стоимость
            <ArrowRight size={18} />
          </button>
          <a
            href={TG_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-white/15 rounded-xl text-white/80 font-medium text-base hover:border-[#E85D04]/50 hover:text-white transition-all duration-300 hover:bg-white/5"
          >
            <Send size={18} />
            Задать вопрос
          </a>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.9 }}
          className="flex flex-wrap gap-10 mt-20 pt-10 border-t border-white/5"
        >
          {[
            { num: '12+', label: 'лет на рынке' },
            { num: '850+', label: 'объектов сдано' },
            { num: '98%', label: 'клиентов довольны' },
            { num: '5 лет', label: 'гарантия' },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-3xl sm:text-4xl font-black text-white">{stat.num}</div>
              <div className="text-sm text-white/40 mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-2 sm:bottom-3 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-white/20 text-xs tracking-widest uppercase">Прокрутите</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="text-white/20"
        >
          <ChevronDown size={20} />
        </motion.div>
      </motion.div>
    </section>
  );
}

// ─────────────────────────────────────────────
// SERVICES (BENTO GRID)
// ─────────────────────────────────────────────

function Services() {
  return (
    <section id="services" className="py-24 bg-[#0A0C10]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeInView>
          <div className="mb-14">
            <span className="text-[#E85D04] text-sm font-semibold tracking-widest uppercase">Что мы делаем</span>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mt-3 tracking-tight">
              Виды ремонта
            </h2>
          </div>
        </FadeInView>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-fr">
          {/* Card 1 – Cosmetic (small) */}
          <FadeInView delay={0.1} className="h-full">
            <ServiceCard service={SERVICES[0]} />
          </FadeInView>

          {/* Card 2 – White Box (small) */}
          <FadeInView delay={0.2} className="h-full">
            <ServiceCard service={SERVICES[1]} />
          </FadeInView>

          {/* Card 3 – Capital (LARGE) */}
          <FadeInView delay={0.15} className="h-full md:col-span-2 lg:col-span-1 lg:row-span-2">
            <ServiceCard service={SERVICES[2]} large />
          </FadeInView>

          {/* Card 4 – Designer (small) */}
          <FadeInView delay={0.3} className="h-full md:col-span-2 lg:col-span-2">
            <ServiceCard service={SERVICES[3]} wide />
          </FadeInView>
        </div>
      </div>
    </section>
  );
}

function ServiceCard({
  service,
  large = false,
  wide = false,
}: {
  service: typeof SERVICES[0];
  large?: boolean;
  wide?: boolean;
}) {
  const Icon = service.icon;
  const serviceBackground =
    service.backgroundImage
      ? {
          backgroundImage: `linear-gradient(160deg, rgba(10, 12, 16, 0.82) 0%, rgba(10, 12, 16, 0.76) 46%, rgba(10, 12, 16, 0.92) 100%), url("${service.backgroundImage}")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }
      : undefined;

  return (
    <motion.div
      whileHover={{ scale: 1.025 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      style={serviceBackground}
      className={`relative group rounded-2xl overflow-hidden cursor-default border border-white/5 bg-gradient-to-br from-[#13161E] to-[#0F1117] p-6 sm:p-8 flex flex-col justify-between ${
        large ? 'h-full min-h-[380px]' : wide ? 'h-full min-h-[180px]' : 'h-full min-h-[220px]'
      }`}
    >
      {/* Gradient border on hover */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, rgba(232,93,4,0.12) 0%, transparent 60%)',
        }}
      />
      <div className="absolute inset-0 rounded-2xl border border-[#E85D04]/0 group-hover:border-[#E85D04]/25 transition-all duration-300 pointer-events-none" />

      <div>
        <div className={`flex items-center justify-center rounded-xl bg-[#E85D04]/10 text-[#E85D04] mb-5 w-fit ${large ? 'p-4' : 'p-3'}`}>
          <Icon size={large ? 28 : 22} />
        </div>
        <h3 className={`font-black text-white tracking-tight mb-2 ${large ? 'text-2xl sm:text-3xl' : wide ? 'text-xl sm:text-2xl' : 'text-xl'}`}>
          {service.title}
        </h3>
        <p className={`text-white/45 leading-relaxed ${large ? 'text-base' : 'text-sm'}`}>
          {service.description}
        </p>
      </div>

      <div className="mt-6 flex items-end justify-between">
        <span className={`font-bold text-[#E85D04] ${large ? 'text-2xl' : 'text-lg'}`}>
          {service.priceLabel}
        </span>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <ArrowRight size={20} className="text-[#E85D04]" />
        </div>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// SMART CALCULATOR
// ─────────────────────────────────────────────

function SmartCalculator() {
  const [area, setArea] = useState(50);
  const [repairType, setRepairType] = useState(REPAIR_TYPES[1]); // Капитальный по умолчанию
  const [isDesign, setIsDesign] = useState(false);
  const [isMaterials, setIsMaterials] = useState(false);
  const [isUrgent, setIsUrgent] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Calculation
  const basePrice = area * repairType.price;
  const designPrice = isDesign ? area * 500 : 0;
  const subTotal = basePrice + designPrice;
  const materialsMarkup = isMaterials ? subTotal * 0.1 : 0;
  const urgentMarkup = isUrgent ? subTotal * 0.2 : 0;
  const finalTotal = subTotal + materialsMarkup + urgentMarkup;
  const deferredFinalTotal = useDeferredValue(finalTotal);

  // Range slider progress
  const rangeProgress = ((area - 10) / (200 - 10)) * 100;

  const formatPrice = (n: number) =>
    n.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 });

  return (
    <section id="calculator" className="py-24 bg-[#0F1117] relative overflow-hidden">
      {/* BG glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-[#E85D04]/4 blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <FadeInView>
          <div className="mb-14">
            <span className="text-[#E85D04] text-sm font-semibold tracking-widest uppercase">Калькулятор</span>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mt-3 tracking-tight">
              Рассчитайте стоимость
            </h2>
            <p className="text-white/40 mt-3 text-base max-w-xl">
              Предварительный расчет за 30 секунд. Точная смета — после осмотра.
            </p>
          </div>
        </FadeInView>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
          {/* Left: Controls */}
          <FadeInView direction="left" delay={0.1}>
            <div className="rounded-2xl border border-white/5 bg-[#13161E] p-6 sm:p-8 space-y-8">
              {/* Area slider */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="text-white font-semibold text-base">Площадь квартиры</label>
                  <div className="flex items-center gap-1">
                    <span className="text-[#E85D04] font-black text-2xl">{area}</span>
                    <span className="text-white/40 text-sm">м²</span>
                  </div>
                </div>
                <div className="relative">
                  <input
                    type="range"
                    min={10}
                    max={200}
                    value={area}
                    onChange={(e) => setArea(Number(e.target.value))}
                    className="w-full"
                    style={{ '--range-progress': `${rangeProgress}%` } as React.CSSProperties}
                  />
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-white/25 text-xs">10 м²</span>
                  <span className="text-white/25 text-xs">200 м²</span>
                </div>
              </div>

              {/* Repair type */}
              <div>
                <label className="text-white font-semibold text-base block mb-4">Тип ремонта</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {REPAIR_TYPES.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setRepairType(type)}
                      className={`relative rounded-xl p-4 text-left border transition-all duration-250 group ${
                        repairType.id === type.id
                          ? 'border-[#E85D04] bg-[#E85D04]/10'
                          : 'border-white/8 bg-white/2 hover:border-white/20'
                      }`}
                    >
                      {repairType.id === type.id && (
                        <motion.div
                          layoutId="type-selector"
                          className="absolute inset-0 rounded-xl bg-[#E85D04]/8"
                          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        />
                      )}
                      <span className={`relative block text-sm font-semibold ${repairType.id === type.id ? 'text-[#E85D04]' : 'text-white/70 group-hover:text-white'}`}>
                        {type.label}
                      </span>
                      <span className={`relative block text-xs mt-1 ${repairType.id === type.id ? 'text-[#E85D04]/70' : 'text-white/30'}`}>
                        {type.price.toLocaleString('ru-RU')} ₽/м²
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Options */}
              <div>
                <label className="text-white font-semibold text-base block mb-4">Дополнительные опции</label>
                <div className="space-y-3">
                  <CheckboxOption
                    checked={isDesign}
                    onChange={setIsDesign}
                    label="Дизайн-проект"
                    badge="+500 ₽/м²"
                  />
                  <CheckboxOption
                    checked={isMaterials}
                    onChange={setIsMaterials}
                    label="Закупка материалов"
                    badge="+10% от суммы"
                  />
                  <CheckboxOption
                    checked={isUrgent}
                    onChange={setIsUrgent}
                    label="Срочный ремонт"
                    badge="+20% от суммы"
                  />
                </div>
              </div>

              {/* Breakdown */}
              <div className="border-t border-white/5 pt-6 space-y-2">
                <CalcRow label={`Базовая стоимость (${area} м² × ${repairType.price.toLocaleString('ru-RU')} ₽)`} value={formatPrice(basePrice)} />
                {isDesign && <CalcRow label={`Дизайн-проект (${area} м² × 500 ₽)`} value={formatPrice(designPrice)} accent />}
                {isMaterials && <CalcRow label="Закупка материалов (+10%)" value={formatPrice(materialsMarkup)} accent />}
                {isUrgent && <CalcRow label="Срочный ремонт (+20%)" value={formatPrice(urgentMarkup)} accent />}
              </div>
            </div>
          </FadeInView>

          {/* Right: Receipt (sticky on desktop) */}
          <FadeInView direction="right" delay={0.2}>
            <div className="lg:sticky lg:top-24">
              <div className="rounded-2xl border border-[#E85D04]/20 bg-gradient-to-b from-[#1A1210] to-[#13161E] p-6 sm:p-8 shadow-2xl shadow-orange-900/10">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6 pb-6 border-b border-white/5">
                  <div className="w-10 h-10 rounded-xl bg-[#E85D04]/15 flex items-center justify-center">
                    <ShieldCheck size={20} className="text-[#E85D04]" />
                  </div>
                  <div>
                    <div className="text-white font-bold text-sm">{COMPANY_NAME}</div>
                    <div className="text-white/35 text-xs">Предварительный расчёт</div>
                  </div>
                </div>

                {/* Summary */}
                <div className="space-y-3 mb-6">
                  <SummaryRow label="Тип ремонта" value={repairType.label} />
                  <SummaryRow label="Площадь" value={`${area} м²`} />
                  {isDesign && <SummaryRow label="Дизайн-проект" value="✓" accent />}
                  {isMaterials && <SummaryRow label="Закупка материалов" value="✓" accent />}
                  {isUrgent && <SummaryRow label="Срочный ремонт" value="✓" accent />}
                </div>

                {/* Price */}
                <div className="rounded-xl bg-[#E85D04]/8 border border-[#E85D04]/20 p-5 mb-6">
                  <div className="text-white/50 text-xs mb-2 uppercase tracking-wider">Итого:</div>
                  <AnimatedTotal total={deferredFinalTotal} />
                  <div className="text-white/30 text-xs mt-2">
                    ≈ {Math.round(finalTotal / area).toLocaleString('ru-RU')} ₽/м²
                  </div>
                </div>

                {/* Disclaimer */}
                <p className="text-white/25 text-xs leading-relaxed mb-6">
                  Финальная стоимость уточняется после бесплатного замера и составления сметы.
                </p>

                {/* CTA */}
                <button
                  onClick={() => setShowModal(true)}
                  className="btn-glow w-full py-4 bg-[#E85D04] rounded-xl text-white font-bold text-sm hover:bg-[#FF6A0F] transition-colors duration-300 flex items-center justify-center gap-2"
                >
                  Оставить заявку на эту сумму
                  <ArrowRight size={16} />
                </button>

                {/* Advantages mini */}
                <div className="mt-6 space-y-2">
                  {['Фиксированная смета', 'Гарантия 5 лет', 'Видеоотчеты в Telegram'].map((item) => (
                    <div key={item} className="flex items-center gap-2 text-xs text-white/35">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#E85D04]" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </FadeInView>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <ContactModal
            totalPrice={finalTotal}
            repairType={repairType.label}
            area={area}
            onClose={() => setShowModal(false)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}

function AnimatedTotal({ total }: { total: number }) {
  const animatedTotal = useAnimatedNumber(total);
  const isOversizedTotal = animatedTotal > 9_999_999;

  return (
    <div className={`font-black text-white tabular-nums leading-none transition-all ${
      isOversizedTotal ? 'text-3xl sm:text-4xl' : 'text-4xl sm:text-5xl'
    }`}>
      {animatedTotal.toLocaleString('ru-RU')}
      <span className="text-[#E85D04] ml-1">₽</span>
    </div>
  );
}

function CheckboxOption({
  checked,
  onChange,
  label,
  badge,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  badge: string;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-all duration-200 text-left ${
        checked ? 'border-[#E85D04]/40 bg-[#E85D04]/8' : 'border-white/6 bg-white/2 hover:border-white/15'
      }`}
    >
      <span className={`transition-colors flex-shrink-0 ${checked ? 'text-[#E85D04]' : 'text-white/25'}`}>
        {checked ? <CheckSquare size={20} /> : <Square size={20} />}
      </span>
      <span className={`flex-1 text-sm font-medium transition-colors ${checked ? 'text-white' : 'text-white/55'}`}>
        {label}
      </span>
      <span className={`text-xs px-2 py-1 rounded-lg transition-colors ${
        checked ? 'bg-[#E85D04]/20 text-[#E85D04]' : 'bg-white/5 text-white/25'
      }`}>
        {badge}
      </span>
    </button>
  );
}

function CalcRow({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className={`text-xs ${accent ? 'text-[#E85D04]/70' : 'text-white/35'}`}>{label}</span>
      <span className={`text-sm font-semibold flex-shrink-0 ${accent ? 'text-[#E85D04]' : 'text-white/60'}`}>{value}</span>
    </div>
  );
}

function SummaryRow({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-white/40">{label}</span>
      <span className={`text-sm font-semibold ${accent ? 'text-[#E85D04]' : 'text-white/80'}`}>{value}</span>
    </div>
  );
}

// ─────────────────────────────────────────────
// ADVANTAGES
// ─────────────────────────────────────────────

function Advantages() {
  return (
    <section id="advantages" className="py-24 bg-[#0A0C10] relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 right-0 w-[500px] h-[400px] rounded-full bg-[#E85D04]/3 blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <FadeInView>
          <div className="mb-14">
            <span className="text-[#E85D04] text-sm font-semibold tracking-widest uppercase">Наши принципы</span>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mt-3 tracking-tight">
              Почему выбирают нас
            </h2>
          </div>
        </FadeInView>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {ADVANTAGES.map((adv, i) => {
            const Icon = adv.icon;
            return (
              <FadeInView key={adv.id} delay={i * 0.1}>
                <motion.div
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.25 }}
                  className="group relative rounded-2xl p-6 border border-white/5 bg-gradient-to-b from-[#13161E] to-[#0F1117] h-full"
                >
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-[#E85D04]/0 to-[#E85D04]/0 group-hover:from-[#E85D04]/5 group-hover:to-transparent transition-all duration-500" />
                  <div className="relative">
                    <div className="w-12 h-12 rounded-xl bg-[#E85D04]/10 flex items-center justify-center mb-5 group-hover:bg-[#E85D04]/20 transition-colors duration-300">
                      <Icon size={24} className="text-[#E85D04]" />
                    </div>
                    <h3 className="text-white font-bold text-lg mb-2">{adv.title}</h3>
                    <p className="text-white/40 text-sm leading-relaxed">{adv.description}</p>
                  </div>
                </motion.div>
              </FadeInView>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// TESTIMONIALS
// ─────────────────────────────────────────────

function Testimonials() {
  const [current, setCurrent] = useState(0);

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  }, []);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % TESTIMONIALS.length);
  }, []);

  return (
    <section id="testimonials" className="py-24 bg-[#0F1117]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeInView>
          <div className="mb-14">
            <span className="text-[#E85D04] text-sm font-semibold tracking-widest uppercase">Отзывы</span>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mt-3 tracking-tight">
              Говорят клиенты
            </h2>
          </div>
        </FadeInView>

        {/* Desktop grid */}
        <div className="hidden md:grid md:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t, i) => (
            <FadeInView key={t.id} delay={i * 0.15}>
              <TestimonialCard testimonial={t} />
            </FadeInView>
          ))}
        </div>

        {/* Mobile carousel */}
        <div className="md:hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.35 }}
            >
              <TestimonialCard testimonial={TESTIMONIALS[current]} />
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center justify-center gap-4 mt-6">
            <button
              onClick={prev}
              className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:border-[#E85D04]/50 hover:text-[#E85D04] transition-all"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="flex gap-2">
              {TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`rounded-full transition-all duration-300 ${
                    i === current ? 'bg-[#E85D04] w-6 h-2' : 'bg-white/15 w-2 h-2'
                  }`}
                />
              ))}
            </div>
            <button
              onClick={next}
              className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:border-[#E85D04]/50 hover:text-[#E85D04] transition-all"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function TestimonialCard({ testimonial }: { testimonial: typeof TESTIMONIALS[0] }) {
  return (
    <div className="group rounded-2xl p-6 border border-white/5 bg-white/[0.03] backdrop-blur-sm h-full flex flex-col hover:border-white/10 transition-colors duration-300">
      {/* Stars */}
      <div className="flex gap-1 mb-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={16}
            className={i < testimonial.rating ? 'text-yellow-400 fill-yellow-400' : 'text-white/15'}
          />
        ))}
      </div>

      {/* Text */}
      <p className="text-white/70 text-sm leading-relaxed flex-1 mb-6 italic">
        «{testimonial.text}»
      </p>

      {/* Author */}
      <div className="flex items-center gap-3 pt-4 border-t border-white/5">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#E85D04] to-[#FF6A0F] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
          {testimonial.avatar}
        </div>
        <div>
          <div className="text-white font-semibold text-sm">{testimonial.name}</div>
          <div className="text-white/30 text-xs">Клиент компании</div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// CONTACT FORM
// ─────────────────────────────────────────────

function ContactForm() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;
    setSubmitted(true);
  };

  return (
    <section id="contact" className="py-24 bg-[#0A0C10] relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full bg-[#E85D04]/4 blur-[120px]" />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <FadeInView>
          <div className="rounded-3xl border border-white/6 bg-gradient-to-b from-[#13161E] to-[#0F1117] p-8 sm:p-12 lg:p-16 text-center">
            <span className="inline-block px-3 py-1 rounded-full border border-[#E85D04]/30 bg-[#E85D04]/10 text-[#E85D04] text-xs font-semibold tracking-wider uppercase mb-6">
              Бесплатная консультация
            </span>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-4 tracking-tight">
              Начните ваш
              <br />
              <span className="text-[#E85D04]">ремонт сегодня</span>
            </h2>
            <p className="text-white/40 text-base mb-10 max-w-xl mx-auto">
              Оставьте заявку — перезвоним в течение 15 минут, ответим на все вопросы и запишем на бесплатный замер.
            </p>

            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-12"
                >
                  <div className="w-16 h-16 rounded-full bg-[#E85D04]/15 flex items-center justify-center mx-auto mb-4">
                    <BadgeCheck size={32} className="text-[#E85D04]" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Заявка принята!</h3>
                  <p className="text-white/40">Перезвоним вам в ближайшее время.</p>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  onSubmit={handleSubmit}
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="max-w-sm mx-auto"
                >
                  <div className="space-y-8 mb-8">
                    {/* Name input */}
                    <div className="relative">
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onFocus={() => setFocused('name')}
                        onBlur={() => setFocused(null)}
                        placeholder="Ваше имя"
                        required
                        className="w-full bg-transparent border-0 border-b pb-3 text-white placeholder-white/25 text-base outline-none transition-all duration-300 focus:placeholder-white/10"
                        style={{
                          borderColor: focused === 'name' ? '#E85D04' : 'rgba(255,255,255,0.12)',
                          borderBottomWidth: '1.5px',
                          borderStyle: 'solid',
                        }}
                      />
                    </div>

                    {/* Phone input */}
                    <div className="relative">
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(formatPhoneInput(e.target.value))}
                          onFocus={() => setFocused('phone')}
                          onBlur={() => setFocused(null)}
                          placeholder="+7 (___) ___-__-__"
                        required
                        className="w-full bg-transparent border-0 border-b pb-3 text-white placeholder-white/25 text-base outline-none transition-all duration-300 focus:placeholder-white/10"
                        style={{
                          borderColor: focused === 'phone' ? '#E85D04' : 'rgba(255,255,255,0.12)',
                          borderBottomWidth: '1.5px',
                          borderStyle: 'solid',
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <button
                      type="submit"
                      className="btn-glow w-full py-4 bg-[#E85D04] rounded-xl text-white font-bold text-base hover:bg-[#FF6A0F] transition-colors duration-300"
                    >
                      Отправить заявку
                    </button>

                    <div className="flex items-center gap-3 my-1">
                      <div className="flex-1 h-px bg-white/8" />
                      <span className="text-white/25 text-xs">или</span>
                      <div className="flex-1 h-px bg-white/8" />
                    </div>

                    <a
                      href={TG_LINK}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-4 border border-white/12 rounded-xl text-white/70 font-medium text-sm hover:border-[#E85D04]/40 hover:text-[#E85D04] transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <Send size={16} />
                      Написать нам в Telegram
                    </a>
                  </div>

                  <p className="text-white/20 text-xs mt-5">
                    Отправляя форму, вы соглашаетесь на обработку персональных данных.
                    <br />
                    Демонстрационная форма: данные никуда не отправляются.
                  </p>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </FadeInView>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// CONTACT MODAL (from calculator)
// ─────────────────────────────────────────────

function ContactModal({
  totalPrice,
  repairType,
  area,
  onClose,
}: {
  totalPrice: number;
  repairType: string;
  area: number;
  onClose: () => void;
}) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;
    setSubmitted(true);
  };

  // Close on backdrop
  const handleBackdrop = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={handleBackdrop}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-md bg-[#13161E] rounded-2xl border border-white/8 p-8 shadow-2xl"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/30 hover:text-white/70 transition-colors"
        >
          <X size={20} />
        </button>

        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-8 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-[#E85D04]/15 flex items-center justify-center mx-auto mb-4">
                <BadgeCheck size={32} className="text-[#E85D04]" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Заявка принята!</h3>
              <p className="text-white/40 text-sm">Перезвоним вам в ближайшее время.</p>
              <button
                onClick={onClose}
                className="mt-6 px-6 py-2.5 border border-white/12 rounded-lg text-white/60 text-sm hover:text-white transition-colors"
              >
                Закрыть
              </button>
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <h3 className="text-2xl font-black text-white mb-2">Оставить заявку</h3>
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="text-xs px-3 py-1 rounded-full bg-white/5 text-white/40">{repairType}</span>
                <span className="text-xs px-3 py-1 rounded-full bg-white/5 text-white/40">{area} м²</span>
                <span className="text-xs px-3 py-1 rounded-full bg-[#E85D04]/15 text-[#E85D04] font-semibold">
                  {totalPrice.toLocaleString('ru-RU')} ₽
                </span>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onFocus={() => setFocused('name')}
                  onBlur={() => setFocused(null)}
                  placeholder="Ваше имя"
                  required
                  className="w-full bg-transparent border-0 border-b pb-3 text-white placeholder-white/25 text-base outline-none"
                  style={{
                    borderColor: focused === 'name' ? '#E85D04' : 'rgba(255,255,255,0.12)',
                    borderBottomWidth: '1.5px',
                    borderStyle: 'solid',
                  }}
                />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(formatPhoneInput(e.target.value))}
                  onFocus={() => setFocused('phone')}
                  onBlur={() => setFocused(null)}
                  placeholder="+7 (___) ___-__-__"
                  required
                  className="w-full bg-transparent border-0 border-b pb-3 text-white placeholder-white/25 text-base outline-none"
                  style={{
                    borderColor: focused === 'phone' ? '#E85D04' : 'rgba(255,255,255,0.12)',
                    borderBottomWidth: '1.5px',
                    borderStyle: 'solid',
                  }}
                />

                <button
                  type="submit"
                  className="btn-glow w-full py-4 bg-[#E85D04] rounded-xl text-white font-bold text-sm hover:bg-[#FF6A0F] transition-colors duration-300"
                >
                  Отправить заявку
                </button>
              </form>

              <p className="text-white/20 text-xs mt-4 text-center">
                Перезвоним в течение 15 минут
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// FOOTER
// ─────────────────────────────────────────────

function Footer() {
  return (
    <footer className="bg-[#0A0C10] border-t border-white/5 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center">
            <span className="font-black text-lg sm:text-xl text-white tracking-tight leading-none">
              СМАРТ<span className="text-[#E85D04]">-Отделка</span>
            </span>
          </div>

          <p className="text-white/20 text-sm text-center">
            © {new Date().getFullYear()} «СМАРТ-Отделка». Ремонт квартир в Москве.
          </p>

          <a
            href={TG_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-white/30 hover:text-[#E85D04] transition-colors duration-300"
          >
            <Send size={15} />
            Telegram
          </a>
        </div>
      </div>
    </footer>
  );
}

// ─────────────────────────────────────────────
// APP ROOT
// ─────────────────────────────────────────────

export default function App() {
  return (
    <div className="bg-[#0A0C10] min-h-screen antialiased">
      <Header />
      <main>
        <HeroSection />
        <Services />
        <SmartCalculator />
        <Advantages />
        <Testimonials />
        <ContactForm />
      </main>
      <Footer />
    </div>
  );
}
