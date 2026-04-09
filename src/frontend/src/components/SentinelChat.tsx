import Anthropic from "@anthropic-ai/sdk";
import { MessageCircle, Send, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { buildSentinelContext } from "@/lib/sentinelContext";
import { Button } from "@/components/ui/button";
import {
	useAllProviders,
	useCanisterState,
	useHandoffCountsByZip,
	useIsAdmin,
} from "../hooks/useQueries";

type Message = { role: "user" | "bot"; text: string };

const QUICK_REPLIES = [
	"Find a live provider",
	"How does Proof of Presence work?",
	"What is Cost Plus Drugs?",
	"I need help now",
];

const ANTHROPIC_API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY as
	| string
	| undefined;

export function SentinelChat() {
	const [open, setOpen] = useState(false);
	const [messages, setMessages] = useState<Message[]>([
		{
			role: "bot",
			text: "Hi! I'm Sentinel, your Live Now Recovery assistant. How can I help you today?",
		},
	]);
	const [input, setInput] = useState("");
	const [isStreaming, setIsStreaming] = useState(false);
	const messagesEndRef = useRef<HTMLDivElement>(null);

	const { data: canisterState } = useCanisterState();
	const { data: isAdmin } = useIsAdmin();
	const { data: providers = [] } = useAllProviders();
	const { data: handoffCounts = [] } = useHandoffCountsByZip();

	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	const sendMessage = async (text: string) => {
		const trimmed = text.trim();
		if (!trimmed || isStreaming) return;

		setInput("");

		// Build API history BEFORE adding the new user message
		const apiHistory: Anthropic.MessageParam[] = messages
			.slice(1) // skip initial greeting
			.filter((m) => m.text.trim())
			.map((m) => ({
				role: m.role === "user" ? "user" : ("assistant" as const),
				content: m.text,
			}));

		setMessages((prev) => [...prev, { role: "user", text: trimmed }]);
		setIsStreaming(true);

		// Immediate crisis escalation — no AI needed
		const lower = trimmed.toLowerCase();
		if (
			lower.includes("overdos") ||
			lower.includes("dying") ||
			lower.includes("suicide") ||
			lower.includes("kill myself") ||
			lower.includes("emergency")
		) {
			setMessages((prev) => [
				...prev,
				{
					role: "bot",
					text: "🚨 CALL NOW: Ohio MAR NOW 833-234-6343 (24/7) · 988 Crisis Lifeline · Emergency: 911. You are not alone.",
				},
			]);
			setIsStreaming(false);
			return;
		}

		// No API key — graceful fallback
		if (!ANTHROPIC_API_KEY) {
			setMessages((prev) => [
				...prev,
				{
					role: "bot",
					text: "For immediate help, call Ohio MAR NOW: 833-234-6343 (24/7). Check the live map for providers near you.",
				},
			]);
			setIsStreaming(false);
			return;
		}

		// Add streaming placeholder
		setMessages((prev) => [...prev, { role: "bot", text: "" }]);

		const client = new Anthropic({
			apiKey: ANTHROPIC_API_KEY,
			dangerouslyAllowBrowser: true,
		});

		const systemPrompt = buildSentinelContext(providers, handoffCounts);
		apiHistory.push({ role: "user", content: trimmed });

		try {
			const stream = client.messages.stream({
				model: "claude-opus-4-6",
				max_tokens: 512,
				system: systemPrompt,
				messages: apiHistory,
			});

			let accumulated = "";

			stream.on("text", (delta) => {
				accumulated += delta;
				setMessages((prev) => {
					const updated = [...prev];
					updated[updated.length - 1] = { role: "bot", text: accumulated };
					return updated;
				});
			});

			await stream.finalMessage();
		} catch {
			setMessages((prev) => {
				const updated = [...prev];
				updated[updated.length - 1] = {
					role: "bot",
					text: "I'm having trouble connecting. For immediate help, call Ohio MAR NOW: 833-234-6343.",
				};
				return updated;
			});
		} finally {
			setIsStreaming(false);
		}
	};

	return (
		<div className="fixed bottom-6 right-6 z-[2000]" data-ocid="chat.panel">
			{open && (
				<div className="mb-3 w-80 bg-card border border-border rounded-2xl shadow-card flex flex-col overflow-hidden">
					{/* Header */}
					<div className="bg-primary/10 border-b border-border px-4 py-3 flex items-center justify-between">
						<div className="flex items-center gap-2">
							<MessageCircle className="w-4 h-4 text-primary" />
							<span className="text-foreground font-semibold text-sm">
								Sentinel AI
							</span>
							{ANTHROPIC_API_KEY && (
								<span className="text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">
									Live
								</span>
							)}
						</div>
						<button
							type="button"
							onClick={() => setOpen(false)}
							className="text-muted-foreground hover:text-foreground transition-colors"
							data-ocid="chat.close_button"
						>
							<X className="w-4 h-4" />
						</button>
					</div>

					{/* Messages */}
					<div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-64">
						{messages.map((m, i) => (
							<div
								key={`msg-${i}-${m.role}`}
								className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
							>
								<div
									className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
										m.role === "user"
											? "bg-primary text-primary-foreground rounded-tr-sm"
											: "bg-muted text-foreground rounded-tl-sm"
									}`}
								>
									{m.text || (
										<span className="opacity-50 animate-pulse">●●●</span>
									)}
								</div>
							</div>
						))}
						<div ref={messagesEndRef} />
					</div>

					{/* Admin canister state */}
					{isAdmin && canisterState && (
						<div className="px-4 py-2 bg-secondary border-t border-border">
							<p className="text-xs font-semibold text-foreground mb-1">
								Canister State
							</p>
							<p className="text-xs text-muted-foreground">
								Active providers:{" "}
								{canisterState.total_active_providers.toString()} | High-risk:{" "}
								{canisterState.high_risk_window_active ? "YES" : "no"}
							</p>
						</div>
					)}

					{/* Text input */}
					<form
						onSubmit={(e) => {
							e.preventDefault();
							sendMessage(input);
						}}
						className="px-3 pt-2 pb-1 border-t border-border flex gap-2"
					>
						<input
							type="text"
							value={input}
							onChange={(e) => setInput(e.target.value)}
							placeholder="Ask anything..."
							disabled={isStreaming}
							className="flex-1 text-sm bg-muted/50 border border-border rounded-lg px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
							data-ocid="chat.input"
						/>
						<button
							type="submit"
							disabled={!input.trim() || isStreaming}
							className="p-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
						>
							<Send className="w-4 h-4" />
						</button>
					</form>

					{/* Quick replies */}
					<div className="p-3 pt-2 space-y-1.5">
						{QUICK_REPLIES.map((q) => (
							<button
								type="button"
								key={q}
								onClick={() => sendMessage(q)}
								disabled={isStreaming}
								className="w-full text-left text-xs px-3 py-2 rounded-lg bg-amber-recovery/10 hover:bg-amber-recovery/20 text-foreground/80 hover:text-foreground transition-colors min-h-[36px] disabled:opacity-50 disabled:cursor-not-allowed"
								data-ocid="chat.button"
							>
								{q}
							</button>
						))}
					</div>
				</div>
			)}

			<Button
				type="button"
				onClick={() => setOpen(!open)}
				className="w-14 h-14 rounded-full bg-primary hover:bg-primary/90 text-white shadow-glow"
				data-ocid="chat.open_modal_button"
			>
				{open ? <X className="w-5 h-5" /> : <MessageCircle className="w-5 h-5" />}
			</Button>
		</div>
	);
}
