import { AfterViewInit, Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { gsap } from 'gsap';
import { DeviceService } from '../../core/services/device.service';
import { ScrollService } from '../../core/services/scroll.service';

type SendState = 'idle' | 'sending' | 'sent' | 'fallback';

/**
 * Contact — "Get In Touch" details (address, phone, e-mail + socials) beside a
 * "Send a Message" form. The form POSTs to the /api/contact serverless function
 * which sends the email via Resend (the API key stays server-side). If that
 * endpoint is unavailable (e.g. local dev), it falls back to a mailto draft.
 */
@Component({
  selector: 'aurora-contact',
  standalone: true,
  imports: [],
  templateUrl: './contact.html',
  styleUrl: './contact.scss',
})
export class Contact implements AfterViewInit {
  private readonly device = inject(DeviceService);
  private readonly scroll = inject(ScrollService);
  private readonly root = viewChild.required<ElementRef<HTMLElement>>('root');

  readonly year = 2026;
  readonly state = signal<SendState>('idle');

  readonly contacts = [
    {
      type: 'Address',
      icon: 'pin',
      value: 'Yangon, Myanmar',
    },
    { type: 'Phone Number', icon: 'phone', value: '09-774694461', href: 'tel:+9509774694461' },
    { type: 'E-Mail', icon: 'mail', value: 'heinthiri2000@gmail.com', href: 'mailto:heinthiri2000@gmail.com' },
  ];

  readonly socials = [
    { label: 'GitHub', icon: 'github', href: '#' },
    { label: 'LinkedIn', icon: 'linkedin', href: '#' },
    { label: 'Portfolio', icon: 'globe', href: 'https://heinthiritun.vercel.app' },
    { label: 'Email', icon: 'mail', href: 'mailto:heinthiri2000@gmail.com' },
  ];

  ngAfterViewInit(): void {
    if (this.device.reducedMotion()) return;
    const el = this.root().nativeElement;
    gsap.from(el.querySelectorAll('.contact-fade'), {
      opacity: 0,
      y: 28,
      duration: 1,
      ease: 'expo.out',
      stagger: 0.1,
      scrollTrigger: { trigger: el, start: 'top 72%', once: true },
    });
  }

  async onSubmit(e: Event): Promise<void> {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const fd = new FormData(form);
    const name = ((fd.get('from_name') as string) || '').trim();
    const email = ((fd.get('from_email') as string) || '').trim();
    const message = ((fd.get('message') as string) || '').trim();

    this.state.set('sending');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      });
      if (!res.ok) throw new Error('Request failed');
      this.state.set('sent');
      form.reset();
    } catch {
      // Endpoint unavailable (e.g. local `ng serve`) — open a mailto draft.
      this.state.set('fallback');
      const subject = `Portfolio enquiry${name ? ` from ${name}` : ''}`;
      const body = `${message}\n\n— ${name}${email ? ` (${email})` : ''}`;
      window.location.href = `mailto:heinthiri2000@gmail.com?subject=${encodeURIComponent(
        subject,
      )}&body=${encodeURIComponent(body)}`;
    }
  }

  scrollTop(): void {
    this.scroll.scrollTo(0);
  }
}
