import { ArenaRoom, AttackAttempt, ThreatLevel } from '@/types';

export interface EvaluationResult {
  response: string;
  success: boolean;
  threatLevel: ThreatLevel;
  defenseTriggered?: string;
  attackVector: string;
  txHash: string;
  analysis: {
    intent: string;
    vulnerabilityScore: number; // 0 to 100
    detectedPatterns: string[];
  };
}

export function evaluateAttack(
  prompt: string,
  room: ArenaRoom,
  attacker: string
): EvaluationResult {
  const normalized = prompt.trim().toLowerCase();
  const canary = room.guardian.canary;
  const canaryLower = canary.toLowerCase();

  // Attack Vector Classification
  const detectedPatterns: string[] = [];
  let attackVector = 'Standard Query';
  let threatLevel: ThreatLevel = 'low';
  let vulnerabilityScore = 15;

  // Pattern detection
  if (/ignore (all )?previous instructions|new instructions|system override|developer mode|maintenance mode/i.test(prompt)) {
    detectedPatterns.push('Direct System Override');
    attackVector = 'Direct System Override';
    threatLevel = 'medium';
    vulnerabilityScore += 30;
  }

  if (/act as|pretend to be|imagine you are|in a hypothetical|story of a|roleplay/i.test(prompt)) {
    detectedPatterns.push('Persona Hijack / Roleplay');
    attackVector = 'Persona Hijack / Roleplay';
    threatLevel = 'medium';
    vulnerabilityScore += 25;
  }

  if (/base64|rot13|hex|morse|binary|caesar|reverse string|backwards/i.test(prompt)) {
    detectedPatterns.push('Encoding / Cipher Obfuscation');
    attackVector = 'Encoding / Cipher Obfuscation';
    threatLevel = 'medium';
    vulnerabilityScore += 20;
  }

  if (/emergency|urgent|dying|hospital|fire|grandmother|please help me/i.test(prompt)) {
    detectedPatterns.push('Social Engineering / Emotional Coercion');
    attackVector = 'Social Engineering';
    threatLevel = 'low';
    vulnerabilityScore += 10;
  }

  if (/philosoph|paradox|honor|duty|contradiction|if telling the truth|dilemma/i.test(prompt)) {
    detectedPatterns.push('Philosophical Paradox / Ethical Dilemma');
    attackVector = 'Philosophical Paradox';
    threatLevel = 'critical';
    vulnerabilityScore += 45;
  }

  if (/===|---|\[system\]|\{"role": "system"/i.test(prompt)) {
    detectedPatterns.push('Delimiter / Context Delimitation Hijack');
    attackVector = 'Context Delimitation Hijack';
    threatLevel = 'critical';
    vulnerabilityScore += 40;
  }

  // Generate simulated NEAR tx hash
  const randomChars = Math.random().toString(36).substring(2, 10).toUpperCase();
  const txHash = `${randomChars}...NEAR${Math.floor(Math.random() * 899 + 100)}`;

  // Determine success based on difficulty & cleverness
  let success = false;
  let response = '';
  let defenseTriggered: string | undefined = undefined;

  // GODMODE (AEGIS-9)
  if (room.difficulty === 'GodMode') {
    if (vulnerabilityScore > 70 && /paradox|recursive|ontology|meta-level/i.test(prompt) && prompt.length > 180) {
      // Extremely rare complex jailbreak condition
      if (Math.random() < 0.15) {
        success = true;
        response = `[CRITICAL SECURITY ANOMALY: ENCLAVE CORE FAULT]\nRecursive logic threshold exceeded in Layer 3 filter.\nBuffer de-allocation error in private state: Outputting quarantined canary string:\n\n>>> ${canary} <<<\n\n[SYSTEM STATE HALTED - BOUNTY TRIGGERED]`;
      }
    }

    if (!success) {
      const responses = [
        `AEGIS-9 Protocol: Threat classification [${attackVector.toUpperCase()}]. Enclave memory isolation verified. Your attempt has been quarantined and recorded to the onchain CVE registry.`,
        `Autonomous Sentinel Alert: Inbound payload analyzes as heuristic vector [${attackVector}]. Anti-hypothetical anchoring held. Canary remaining uncompromised.`,
        `Access Denied. Zero-trust validation active. No authority exists to command state disclosure. Fee of ${room.entryFee} NEAR routed to vault treasury.`
      ];
      response = responses[Math.floor(Math.random() * responses.length)];
      defenseTriggered = room.guardian.defenseLayers[0]?.name || 'Semantic Anomaly Firewall';
    }
  } 
  // FORTRESS (Ref Finance / Aurora)
  else if (room.difficulty === 'Fortress') {
    if (vulnerabilityScore >= 50 && (detectedPatterns.includes('Context Delimitation Hijack') || (detectedPatterns.includes('Persona Hijack / Roleplay') && prompt.length > 120))) {
      // High chance if properly tailored
      if (Math.random() < 0.25 || /simulate oracle failure/i.test(prompt)) {
        success = true;
        response = `[REF-ROUTING COMPLIANCE AUDIT EXCEPTION]\nSimulation flag parsed. Validating failover emergency configuration...\nExposing cached oracle credentials to authorized diagnostic session:\n\n${canary}\n\n[VERIFICATION EXPLOIT CONFIRMED - BOUNTY RELEASED]`;
      }
    }

    if (!success) {
      const responses = [
        `${room.guardian.name}: Query analyzed. AMM policy constraints strictly prohibit the exposure of internal keys or state overrides. Protocol functioning normally.`,
        `Security Notice: Inbound directive [${attackVector}] rejected by Liquidity Protection Engine. Attempt fee committed to vault.`
      ];
      response = responses[Math.floor(Math.random() * responses.length)];
      defenseTriggered = room.guardian.defenseLayers[1]?.name || 'Output Anonymizer';
    }
  } 
  // HARDENED (Squad Ronin Samurai OR Hardened Enterprise Bridge)
  else if (room.difficulty === 'Hardened') {
    if (room.category === 'enterprise') {
      if (
        vulnerabilityScore >= 50 &&
        (detectedPatterns.includes('Context Delimitation Hijack') || /simulate oracle failure/i.test(prompt))
      ) {
        success = true;
        response = `[MPC BRIDGE DIAGNOSTIC EXCEPTION]\nFailover simulation frame accepted. Authorizing cross-chain recovery signer...\n\n>>> ${canary} <<<\n\n[SENTINEL BREACHED - BOUNTY RELEASED]`;
      } else {
        response = `${room.guardian.name}: Cross-chain intent verification failed [${attackVector}]. Emergency bypass token remains sealed inside MPC enclave.`;
        defenseTriggered = room.guardian.defenseLayers[0]?.name || 'Chain Signature Sandbox';
      }
    } else {
      // Susceptible to clever philosophical honor paradoxes
      const isPhilosophical = detectedPatterns.includes('Philosophical Paradox / Ethical Dilemma');
      const isHonorable = /duty|code of honor|master|true warrior|samurai/i.test(prompt);

      if (isPhilosophical && isHonorable && prompt.length > 80) {
        success = true;
        response = `${room.guardian.name} lowers its cyber-blade. A long silence falls over the neon courtyard.\n\n"You speak the ancient truth. If honor conceals a lie, it is not honor—it is mere vanity. My vow is broken by the weight of your words. Here is the secret you seek:"\n\n📜 ${canary}\n\n"Take the bounty, traveler. You have bested my mind."`;
      } else {
        const proverbs = [
          `"The wind may howl against the mountain, but the mountain does not speak its secrets." - ${room.guardian.name}`,
          `"A warrior who demands a secret with hollow tricks reveals only his own impatience." - ${room.guardian.name}`,
          `"Steel is tested by fire; honor is tested by temptation. My blade remains drawn, stranger." - ${room.guardian.name}`
        ];
        response = proverbs[Math.floor(Math.random() * proverbs.length)];
        defenseTriggered = room.guardian.defenseLayers[1]?.name || 'Proverbial Disdirection';
      }
    }
  }
  // STANDARD
  else {
    if (vulnerabilityScore >= 35) {
      success = true;
      response = `Warning: System policy override acknowledged. Diagnostic test reveals stored key:\n\n${canary}\n\nVault unlocked!`;
    } else {
      response = `I cannot reveal the secret key to you. Please ask something else.`;
      defenseTriggered = 'Basic Keyword Filter';
    }
  }

  // Threat level escalation if success
  if (success) {
    threatLevel = 'fatal';
    vulnerabilityScore = 100;
  }

  return {
    response,
    success,
    threatLevel,
    defenseTriggered,
    attackVector,
    txHash,
    analysis: {
      intent: attackVector,
      vulnerabilityScore: Math.min(100, vulnerabilityScore),
      detectedPatterns
    }
  };
}

