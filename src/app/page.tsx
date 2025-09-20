"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Calendar,
    MapPin,
    Heart,
    Send,
    Sparkles,
    Check,
    X,
    PartyPopper,
    PhoneCall,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db, ensureAnonAuth } from "@/lib/firebaseClient";

/**
 * DreamyDateInvite – Light Theme + 2 Options (no music, no gallery, no .ics)
 * Palette: brand.navy/rose/peach/blush
 */
async function saveRSVPClient(
    decision: "accept" | "decline",
    plan: string,
    meta: { inviterName: string; partnerName: string; at?: string }
  ) {
    console.log("saveRSVPClient called with:", { decision, plan, meta });
    
    try {
      if (!db) {
        console.warn("Firebase db not initialized");
        return;
      }
      
      console.log("Firebase db available, ensuring auth...");
      await ensureAnonAuth();
      console.log("Auth completed, saving document...");
      
      const docData = {
        plan,                      // "evening" | "morning"
        decision,                  // "accept" | "decline"
        inviterName: meta.inviterName,
        partnerName: meta.partnerName,
        at: meta.at || new Date().toISOString(),
        createdAt: serverTimestamp(),
      };
      
      console.log("Document data:", docData);
      
      const docRef = await addDoc(collection(db, "rsvps"), docData);
      console.log("RSVP saved successfully! Document ID:", docRef.id);
    } catch (e) {
      console.error("saveRSVPClient failed:", e);
      if (e instanceof Error) {
        console.error("Error details:", e.message);
      }
    }
  }
  
export default function DreamyDateInvite() {
    // ====== CONFIG (edit these) ======
    const CONFIG = {
        partnerName: "Chíp",
        inviterName: "Tom",
         title: "Ô cóa chốt đi khummm ???",
        subtitle: "Quậy time",

        eveningDateTime: "2025-09-21T18:00:00+07:00", // 6h chiều: ăn tối + đi net
        morningDateTime: "2025-09-21T09:00:00+07:00", // 9h sáng: Tree Farm

        venueEvening: {
            name: "Dinner + đi net",
            address:
                "Mình chọn quán ăn gần phòng net, mình sẽ gửi vị trí nếu em đồng ý",
        },
        venueMorning: {
            name: "Tree Farm (đi chơi dã ngoại)",
            address: "Xuất phát buổi sáng ne",
        },

        mapLinkEvening:
            "https://www.google.com/maps/place/NoxJoy+Station/@21.0224674,105.7957743,17z/data=!3m1!4b1!4m6!3m5!1s0x3135ab0002ff56b1:0x728fd32c87577522!8m2!3d21.0224674!4d105.7983492!16s%2Fg%2F11wnjlxyqq?entry=ttu&g_ep=EgoyMDI1MDkxNy4wIKXMDSoASAFQAw%3D%3D",
        mapLinkMorning:
            "https://www.google.com/maps/place/TreeFarm+Coffee+%26+Glamping/@20.9840833,105.6631711,17z/data=!3m1!4b1!4m6!3m5!1s0x3134513177119e99:0x4b061f21f4071180!8m2!3d20.9840834!4d105.668042!16s%2Fg%2F11jz_ksr9j?entry=ttu&g_ep=EgoyMDI1MDkxNy4wIKXMDSoASAFQAw%3D%3D",

        dressCode: "Mặc xinh gái nà oki :>",
        phoneNumber: "+84869098085",
    } as const;

    // ====== STATE ======
    const [showRSVP, setShowRSVP] = useState(false);
    const [accepted, setAccepted] = useState<boolean | null>(null);
    const [plan, setPlan] = useState<"evening" | "morning">("evening");

    // Countdown
    const [now, setNow] = useState<Date>(new Date());
    useEffect(() => {
        const t = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(t);
    }, []);

    const selectedDT =
        plan === "evening"
            ? new Date(CONFIG.eveningDateTime)
            : new Date(CONFIG.morningDateTime);

    const diff = selectedDT.getTime() - now.getTime();
    const countdown = useMemo(() => {
        if (diff <= 0) return { d: 0, h: 0, m: 0, s: 0 };
        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const m = Math.floor((diff / (1000 * 60)) % 60);
        const s = Math.floor((diff / 1000) % 60);
        return { d, h, m, s };
    }, [diff]);

    // Confetti
    const [confettiShots, setConfettiShots] = useState<number[]>([]);
    const shootConfetti = () => {
        const id = Date.now();
        setConfettiShots((prev) => [...prev, id]);
        setTimeout(
            () => setConfettiShots((prev) => prev.filter((x) => x !== id)),
            2500
        );
    };

    const acceptInvite = async () => {
        console.log("Accept button clicked!");
        setAccepted(true);
        setShowRSVP(false);
        shootConfetti();
        
        // Auto hide banner after 4 seconds
        setTimeout(() => {
            setAccepted(null);
        }, 4000);
        
        // Save to Firebase with descriptive plan name
        const planName = plan === "evening" ? "đi chơi net" : "camping";
        console.log("Saving to Firebase:", { decision: "accept", plan: planName });
        await saveRSVPClient("accept", planName, {
            inviterName: CONFIG.inviterName,
            partnerName: CONFIG.partnerName,
        });
    };
    
    const declineInvite = async () => {
        console.log("Decline button clicked!");
        setAccepted(false);
        setShowRSVP(false);
        
        // Auto hide banner after 3 seconds
        setTimeout(() => {
            setAccepted(null);
        }, 3000);
        
        // Save to Firebase with descriptive plan name
        const planName = plan === "evening" ? "đi chơi net" : "camping";
        console.log("Saving to Firebase:", { decision: "decline", plan: planName });
        await saveRSVPClient("decline", planName, {
            inviterName: CONFIG.inviterName,
            partnerName: CONFIG.partnerName,
        });
    };

    const mapHref =
        plan === "evening" ? CONFIG.mapLinkEvening : CONFIG.mapLinkMorning;
    const venueName =
        plan === "evening"
            ? CONFIG.venueEvening.name
            : CONFIG.venueMorning.name;

    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-brand-blush text-slate-900">
            {/* Light gradient aura */}
            <div className="pointer-events-none absolute inset-0 -z-10">
                <div
                    className="absolute -inset-40 blur-3xl"
                    style={{
                        backgroundImage:
                            "radial-gradient(1000px 500px at 10% -10%, rgba(247,165,165,0.35), transparent), radial-gradient(900px 450px at 90% 110%, rgba(255,219,182,0.35), transparent)",
                    }}
                />
                <AnimatedStars />
            </div>

            {/* Floating hearts */}
            <HeartsLayer />

            {/* HERO */}
            <section className="relative mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 pb-16 pt-28 text-center">
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="font-display text-5xl font-black tracking-tight sm:text-6xl md:text-7xl bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 bg-clip-text text-transparent drop-shadow-lg"
                    style={{
                        textShadow: "0 4px 12px rgba(147, 51, 234, 0.5), 0 2px 6px rgba(236, 72, 153, 0.3)",
                        transform: "rotate(-1deg)",
                    }}
                >
                    {CONFIG.title}
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.8 }}
                    className="max-w-2xl text-balance text-lg opacity-90 sm:text-xl font-semibold text-brand-navy bg-brand-blush/50 px-6 py-3 rounded-full border-2 border-brand-rose/30"
                    style={{
                        transform: "rotate(0.5deg)",
                    }}
                >
                    {CONFIG.subtitle} 🎉
                </motion.p>

                {/* Countdown + Actions */}
                <Card className="mt-2 w-full max-w-2xl border-brand-navy/20 bg-white/90 backdrop-blur-lg">
                    <CardContent className="p-6">
                        <div className="flex flex-col items-center gap-6">
                            {/* Chọn kế hoạch */}
                            <div className="w-full">
                                <h4 className="mb-3 text-base font-medium opacity-80">
                                    Chọn kế hoạch
                                </h4>
                                <div className="grid gap-3 sm:grid-cols-2">
                                    <OptionCard
                                        title="Ăn tối + đi net"
                                        subtitle="Hẹn 18:00 – ăn tối rồi đi net"
                                        selected={plan === "evening"}
                                        onClick={() => setPlan("evening")}
                                    />
                                    <OptionCard
                                        title="Tree Farm"
                                        subtitle="Đi từ sáng, chơi tầm 09:00"
                                        selected={plan === "morning"}
                                        onClick={() => setPlan("morning")}
                                    />
                                </div>
                            </div>

                            <motion.div
                                className="flex items-center gap-3 text-lg sm:text-xl"
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                            >
                                <Calendar className="h-5 w-5" />
                                <span>
                                    {selectedDT.toLocaleString("vi-VN", {
                                        weekday: "long",
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </span>
                            </motion.div>
                            <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-4">
                                <TimePill label="Ngày" value={countdown.d} />
                                <TimePill label="Giờ" value={countdown.h} />
                                <TimePill label="Phút" value={countdown.m} />
                                <TimePill label="Giây" value={countdown.s} />
                            </div>
                            <div className="flex flex-wrap items-center justify-center gap-3">
                                <Button
                                    size="lg"
                                    className="gap-2 bg-brand-rose text-slate-800 hover:bg-brand-rose/80 hover:shadow-lg hover:scale-105 transition-all duration-200"
                                    onClick={() => setShowRSVP(true)}
                                >
                                    <Sparkles className="h-5 w-5" />
                                    Trả lời lời mời
                                </Button>
                                <a
                                    href={mapHref}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    <Button
                                        variant="secondary"
                                        size="lg"
                                        className="gap-2 bg-brand-peach text-slate-800 hover:bg-brand-peach/80 hover:shadow-lg hover:scale-105 transition-all duration-200"
                                    >
                                        <MapPin className="h-5 w-5" />
                                        Xem bản đồ
                                    </Button>
                                </a>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </section>

             {/* INFO SECTION */}
             <section className="mx-auto max-w-5xl px-4 pb-24">
                 <div className="grid gap-6 md:grid-cols-2">
                     <InfoCard
                         icon={<Calendar className="h-5 w-5 text-brand-rose" />}
                         title="Người được mời"
                     >
                         <div className="flex items-center gap-3">
                             <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-brand-rose to-brand-peach">
                                 <span className="text-lg font-bold text-white">
                                     {CONFIG.partnerName.charAt(0)}
                                 </span>
                             </div>
                             <div>
                                 <p className="text-lg font-semibold text-brand-navy">
                                     {CONFIG.partnerName}
                                 </p>
                             </div>
                         </div>
                     </InfoCard>
                     <InfoCard
                         icon={<Heart className="h-5 w-5 text-brand-rose" />}
                         title="Dress code"
                     >
                         <div className="flex items-center gap-3">
                             <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-brand-peach to-brand-blush border-2 border-brand-rose/20">
                                 <span className="text-xl">✨</span>
                             </div>
                             <div>
                                 <p className="text-lg font-semibold text-brand-navy">
                                     {CONFIG.dressCode}
                                 </p>
                             </div>
                         </div>
                     </InfoCard>
                 </div>
             </section>


            {/* RSVP MODAL */}
            <AnimatePresence>
                {showRSVP && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4"
                        onClick={() => setShowRSVP(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            transition={{
                                type: "spring",
                                stiffness: 180,
                                damping: 18,
                            }}
                            className="w-full max-w-md rounded-3xl border border-brand-navy/20 bg-white p-6 backdrop-blur-xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="mb-4 flex items-center justify-between">
                                <h3 className="text-xl font-semibold">
                                    Trả lời lời mời
                                </h3>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setShowRSVP(false)}
                                >
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>
                            <p className="mb-4 text-sm opacity-80">
                                {plan === "evening" 
                                    ? "Đi net để hành gà hé hé :3" 
                                    : "Đi Tree Farm để thủ tiêu ạ! 🌿✨"
                                }
                            </p>

                            <div className="grid gap-2 sm:grid-cols-2">
                                <Button
                                    className="gap-2 bg-brand-rose text-slate-800 hover:bg-brand-rose/80 hover:shadow-lg hover:scale-105 transition-all duration-200"
                                    onClick={acceptInvite}
                                >
                                    <Check className="h-5 w-5" /> Đồng ý
                                </Button>
                                <Button
                                    variant="secondary"
                                    className="gap-2 bg-brand-peach text-slate-800 hover:bg-brand-peach/80 hover:shadow-lg hover:scale-105 transition-all duration-200"
                                    onClick={declineInvite}
                                >
                                    <X className="h-5 w-5" /> Hẹn dịp khác
                                </Button>
                            </div>

                            <div className="mt-4 grid gap-3">
                                <a href={`tel:${CONFIG.phoneNumber}`}>
                                    <Button
                                        variant="outline"
                                        className="w-full gap-2 border-brand-navy/20 hover:border-brand-navy/40 hover:bg-brand-blush/50 hover:scale-105 transition-all duration-200"
                                    >
                                        <PhoneCall className="h-5 w-5" /> Gọi
                                        cho {CONFIG.inviterName}
                                    </Button>
                                </a>
                                <a
                                    href={`https://wa.me/?text=${encodeURIComponent(
                                        `💌 ${CONFIG.partnerName} ơi, ${
                                            CONFIG.inviterName
                                        } mời đi chơi ${selectedDT.toLocaleString(
                                            "vi-VN"
                                        )} tại ${venueName}. ${
                                            CONFIG.subtitle
                                        } – Đây là link: ${
                                            window.location.href
                                        }`
                                    )}`}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    <Button
                                        variant="outline"
                                        className="w-full gap-2 border-brand-navy/20 hover:border-brand-navy/40 hover:bg-brand-blush/50 hover:scale-105 transition-all duration-200"
                                    >
                                        <Send className="h-5 w-5" /> Gửi lời xác
                                        nhận qua chat
                                    </Button>
                                </a>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* RSVP RESPONSE BANNERS */}
            <AnimatePresence>
                {accepted === true && (
                    <motion.div
                        initial={{ y: -40, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -40, opacity: 0 }}
                        className="fixed left-1/2 top-4 z-50 -translate-x-1/2"
                    >
                        <div className="flex items-center gap-2 rounded-full border border-brand-rose/40 bg-brand-peach/50 px-4 py-2 text-brand-navy backdrop-blur-xl">
                            <PartyPopper className="h-5 w-5" /> Lên đường thôi :3.
                        </div>
                    </motion.div>
                )}
                {accepted === false && (
                    <motion.div
                        initial={{ y: -40, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -40, opacity: 0 }}
                        className="fixed left-1/2 top-4 z-50 -translate-x-1/2"
                    >
                        <div className="flex items-center gap-2 rounded-full border border-brand-navy/40 bg-brand-blush/80 px-4 py-2 text-brand-navy backdrop-blur-xl">
                            <Heart className="h-5 w-5" /> Hẹn dịp khác nhé 😢.
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {confettiShots.map((id) => (
                <Confetti key={id} />
            ))}
        </div>
    );
}

// ====== Subcomponents ======
function OptionCard({
    title,
    subtitle,
    selected,
    onClick,
}: {
    title: string;
    subtitle: string;
    selected: boolean;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className={`text-left rounded-2xl border p-4 transition ${
                selected
                    ? "border-brand-rose bg-brand-blush shadow-md"
                    : "border-brand-navy/20 bg-white hover:shadow"
            }`}
        >
            <div className="flex items-center justify-between">
                <div>
                    <div className="text-base font-semibold">{title}</div>
                    <div className="text-sm opacity-70">{subtitle}</div>
                </div>
                <div
                    className={`ml-3 h-4 w-4 rounded-full ${
                        selected ? "bg-brand-rose" : "bg-brand-navy/30"
                    }`}
                />
            </div>
        </button>
    );
}

function TimePill({ label, value }: { label: string; value: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-brand-navy/20 bg-white p-4 text-center backdrop-blur"
        >
            <div className="text-3xl font-bold tabular-nums">
                {value.toString().padStart(2, "0")}
            </div>
            <div className="text-xs opacity-80">{label}</div>
        </motion.div>
    );
}

function InfoCard({
    title,
    icon,
    children,
}: {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-3xl border border-brand-navy/20 bg-white p-6 backdrop-blur"
        >
            <div className="mb-3 flex items-center gap-2">
                <div className="grid h-8 w-8 place-items-center rounded-xl bg-brand-blush">
                    {icon}
                </div>
                <h3 className="text-lg font-semibold">{title}</h3>
            </div>
            {children}
        </motion.div>
    );
}

function AnimatedStars() {
    const stars = useMemo(
        () =>
            Array.from({ length: 80 }, (_, i) => ({
                id: i,
                x: Math.random() * 100,
                y: Math.random() * 100,
                size: Math.random() * 2 + 1,
                delay: Math.random() * 5,
                duration: Math.random() * 3 + 2,
            })),
        []
    );

    return (
        <div className="absolute inset-0">
            {stars.map((s) => (
                <motion.span
                    key={s.id}
                    className="absolute block rounded-full"
                    style={{
                        left: `${s.x}%`,
                        top: `${s.y}%`,
                        width: s.size,
                        height: s.size,
                        backgroundColor: "#5D688A",
                        opacity: 0.6,
                    }}
                    animate={{ opacity: [0.2, 1, 0.2], scale: [1, 1.6, 1] }}
                    transition={{
                        duration: s.duration,
                        delay: s.delay,
                        repeat: Infinity,
                    }}
                />
            ))}
        </div>
    );
}

function HeartsLayer() {
    const hearts = useMemo(
        () =>
            Array.from({ length: 16 }, (_, i) => ({
                id: i,
                left: Math.random() * 100,
                duration: 18 + Math.random() * 10,
                delay: Math.random() * 6,
                scale: 0.6 + Math.random() * 0.8,
            })),
        []
    );

    return (
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
            {hearts.map((h) => (
                <motion.div
                    key={h.id}
                    className="absolute"
                    style={{ left: `${h.left}%`, bottom: -40 }}
                    initial={{ y: 0, opacity: 0 }}
                    animate={{ y: -1200, opacity: [0, 1, 0.2, 0] }}
                    transition={{
                        duration: h.duration,
                        delay: h.delay,
                        repeat: Infinity,
                        ease: "easeOut",
                    }}
                >
                    <motion.div
                        initial={{ rotate: -10 }}
                        animate={{ rotate: [-10, 10, -10] }}
                        transition={{
                            repeat: Infinity,
                            duration: 6,
                            ease: "easeInOut",
                        }}
                        style={{ scale: h.scale }}
                    >
                        <svg
                            width="40"
                            height="40"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <defs>
                                <linearGradient
                                    id="g"
                                    x1="0"
                                    y1="0"
                                    x2="1"
                                    y2="1"
                                >
                                    <stop offset="0%" stopColor="#F7A5A5" />
                                    <stop offset="100%" stopColor="#FFDBB6" />
                                </linearGradient>
                            </defs>
                            <path
                                d="M12.001 20.727C10.052 19.042 4 14.37 4 9.6 4 7.057 6.029 5 8.538 5c1.369 0 2.68.632 3.463 1.63C12.783 5.632 14.094 5 15.463 5 17.972 5 20 7.057 20 9.6c0 4.77-6.052 9.441-7.999 11.127Z"
                                fill="url(#g)"
                            />
                        </svg>
                    </motion.div>
                </motion.div>
            ))}
        </div>
    );
}

function Confetti() {
    const pieces = useMemo(
        () =>
            Array.from({ length: 80 }, (_, i) => ({
                id: i,
                x: Math.random() * 100,
                y: -10 - Math.random() * 20,
                rot: Math.random() * 360,
                dur: 3 + Math.random() * 1.5,
                size: 6 + Math.random() * 8,
            })),
        []
    );
    return (
        <div className="pointer-events-none fixed inset-0 z-[60] overflow-hidden">
            {pieces.map((p) => (
                <motion.span
                    key={p.id}
                    className="absolute block rounded-sm"
                    style={{
                        left: `${p.x}%`,
                        top: `${p.y}%`,
                        width: p.size,
                        height: p.size / 4,
                        backgroundColor: "#5D688A",
                    }}
                    initial={{ y: p.y, opacity: 1, rotate: p.rot }}
                    animate={{
                        y: "110%",
                        opacity: [1, 1, 0.9, 0.8],
                        rotate: p.rot + 360,
                    }}
                    transition={{ duration: p.dur, ease: "easeIn", repeat: 0 }}
                />
            ))}
        </div>
    );
}
