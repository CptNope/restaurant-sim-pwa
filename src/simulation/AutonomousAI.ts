import { AIPolicySettings, StaffMember, OrderTicket, GuestEntity, PlacedObject, MenuItem } from '../types/restaurant';

export class AutonomousAIDirector {
  private lastEvaluationTime: number = 0;
  private evaluationInterval: number = 2.0; // every 2 seconds

  public evaluateAndDirect(
    delta: number,
    settings: AIPolicySettings,
    staff: StaffMember[],
    guests: GuestEntity[],
    tickets: OrderTicket[],
    objects: PlacedObject[],
    menu: MenuItem[],
    cash: number,
    onRestock?: (cost: number) => void,
    onHireStaff?: (role: StaffMember['role']) => void
  ): {
    notifications: string[];
    suggestedActions: string[];
  } {
    const notifications: string[] = [];
    const suggestedActions: string[] = [];

    if (!settings.enabled) {
      return { notifications, suggestedActions };
    }

    this.lastEvaluationTime += delta;
    if (this.lastEvaluationTime < this.evaluationInterval) {
      return { notifications, suggestedActions };
    }
    this.lastEvaluationTime = 0;

    // Bottleneck Analysis
    const queuedGuests = guests.filter(g => g.state === 'waiting_queue');
    const waitingForFood = guests.filter(g => g.state === 'waiting_food');
    const dirtyTables = objects.filter(o => o.type.startsWith('table') && (o.dirtyPlates || 0) > 0);
    const pendingTickets = tickets.filter(t => t.status === 'ordered');
    const readyPlates = tickets.filter(t => t.status === 'cooked_ready');

    const hosts = staff.filter(s => s.role === 'host');
    const waiters = staff.filter(s => s.role === 'waiter');
    const chefs = staff.filter(s => s.role === 'chef');
    const bussers = staff.filter(s => s.role === 'busser');

    // 1. Auto Dynamic Role Balancing
    if (settings.autoReassignStaffRoles) {
      // If dirty tables are high and no busser, reassign idle waiter or host temporarily
      if (dirtyTables.length >= 2 && bussers.length === 0 && waiters.length > 1) {
        const idleWaiter = waiters.find(w => w.state === 'idle');
        if (idleWaiter) {
          suggestedActions.push(`AI Priority: Tasked ${idleWaiter.name} to urgent table bussing.`);
        }
      }

      // If kitchen has high backlog of tickets and chef is overwhelmed
      if (pendingTickets.length > 3 && chefs.length === 1 && cash > 500 && settings.autoHireWhenQueuesLong) {
        onHireStaff?.('chef');
        notifications.push(`AI Director: Auto-hired Assistant Chef to clear 4+ backed-up orders!`);
      }
    }

    // 2. Auto-Restock / Quality Optimization
    if (settings.autoRestockIngredients && cash > 150) {
      // Periodic bulk restocking to secure 10% wholesale cost reduction
      if (Math.random() < 0.15) {
        const restockCost = 45;
        if (cash >= restockCost) {
          onRestock?.(restockCost);
          notifications.push(`AI Director: Bulk restocked fresh organic ingredients (-$${restockCost}).`);
        }
      }
    }

    // 3. Queue Management
    if (queuedGuests.length >= 4 && settings.autoHireWhenQueuesLong && cash >= 400 && waiters.length < 3) {
      onHireStaff?.('waiter');
      notifications.push(`AI Director: Long queue detected! Auto-hired Waitstaff to accelerate turnover.`);
    }

    // 4. Policy Specific Tuning
    if (settings.mode === 'aggressive_marketing') {
      // High volume strategy
      if (readyPlates.length > 0) {
        suggestedActions.push('Rush service: Plated meals waiting for pickup counter delivery.');
      }
    } else if (settings.mode === 'vip_luxury') {
      // VIP strategy: prioritize lowest patience guest
      const lowPatience = guests.filter(g => g.patience < 40 && g.state !== 'exited' && g.state !== 'paid_leaving');
      if (lowPatience.length > 0) {
        suggestedActions.push(`VIP Care: Guest ${lowPatience[0].name} patience below 40% - prioritizing table!`);
      }
    }

    return { notifications, suggestedActions };
  }
}

export const aiDirector = new AutonomousAIDirector();
