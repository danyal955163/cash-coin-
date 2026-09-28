"use client";
import { ExternalLink } from "lucide-react";
export default function TimeWallOpenButton({ placement, username, children, className, icon }: { placement: string; username: string; children: React.ReactNode; className: string; icon?: React.ReactNode }) { function open() { const url = `https://timewall.io/offerwall/${encodeURIComponent(placement)}?user_id=${encodeURIComponent(username)}`; window.open(url, "_blank", "noopener,noreferrer"); } return <button type="button" onClick={open} className={className}>{icon ?? <ExternalLink size={17} />}{children}</button>; }
