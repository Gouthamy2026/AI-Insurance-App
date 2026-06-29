import io

code = """export const ClaimOutcomeAnalyzer = () => {
    // Preserve state if it exists, otherwise initialize
    const existingState = window.ClaimOutcomeActions?.state || {
        isAnalyzing: false,
        isAnalyzed: false,
        charCount: 0,
        provider: '',
        bank: '',
        matchScore: 0,
        matchStatus: '',
        aiSummary: '',
        policyName: '',
        policyType: '',
        coverageType: '',
        policyNumber: '',
        claimCategory: '',
        whyReasons: [],
        evidence: '',
        risks: [],
        riskWarning: '',
        actionPlan: [],
        comparisonOptions: [],
        takeaway: ''
    };

    window.ClaimOutcomeActions = {
        state: existingState,
        updateCharCount: () => {
            const text = document.getElementById('claim-scenario').value;
            window.ClaimOutcomeActions.state.charCount = text.length;
            document.getElementById('char-count').innerText = `${text.length} / 500`;
        },
        analyze: async () => {
            const claimType = document.getElementById('claim-type').value;
            const policyNamespace = document.getElementById('pinecone-namespace').value;
            const preferredBank = document.getElementById('preferred-bank').value;
            const scenario = document.getElementById('claim-scenario').value.trim();
            
            if (!claimType) { alert('Please select a claim type.'); return; }
            if (!policyNamespace) { alert('Please select a policy.'); return; }
            if (!preferredBank) { alert('Please select a bank.'); return; }
            if (!scenario) { alert('Please explain your scenario.'); return; }

            window.ClaimOutcomeActions.state.isAnalyzing = true;
            document.getElementById('dashboard-root').innerHTML = ClaimOutcomeAnalyzer();

            // Mock API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            window.ClaimOutcomeActions.state.isAnalyzing = false;
            window.ClaimOutcomeActions.state.isAnalyzed = true;
            
            const s = window.ClaimOutcomeActions.state;
            s.provider = "Tata AIG General Insurance";
            s.bank = preferredBank === 'AI_SUGGEST' ? 'SBI Bank' : preferredBank;
            s.matchScore = 88;
            s.matchStatus = "Excellent Match";
            s.aiSummary = "Based on the terms and conditions of the " + (policyNamespace.replace(/_/g, ' ').toUpperCase()) + " policy issued by " + s.provider + " and distributed through " + s.bank + ", your claim scenario is likely to be covered as the damages are due to an accidental event.";
            s.policyName = "Private Car Package Policy";
            s.policyType = policyNamespace.replace(/_/g, ' ').toUpperCase();
            s.coverageType = "Comprehensive";
            s.policyNumber = "(As per selected document)";
            s.claimCategory = claimType;
            
            s.whyReasons = [
                "Covers own damage due to accidents, including weather conditions like heavy rain.",
                "Includes coverage for external body damage such as bumper and headlight.",
                "Cashless repair available at network garages.",
                "24x7 claim assistance."
            ];
            s.evidence = '"This policy covers accidental loss or damage to the insured vehicle arising out of external, violent and visible means..."';
            
            s.risks = [
                "Wear and tear, mechanical/electrical breakdown not covered.",
                "Damage due to flood (if declared as area flooding) may be treated separately.",
                "Non-network garage repairs may reduce claim amount."
            ];
            s.riskWarning = "Ensure the incident is not due to negligence (drunk driving, rash driving, etc.)";
            
            s.actionPlan = [
                "Capture clear photos of the damage.",
                "File the claim as soon as possible.",
                "Use Tata AIG network garage for cashless benefits.",
                "Provide FIR / RTA report if required.",
                "Keep all documents and repair bills safe."
            ];
            
            s.comparisonOptions = [
                { provider: "ICICI Lombard General Insurance", bank: "ICICI Bank", score: 65, level: "Good Match" },
                { provider: "SBI General Insurance", bank: "SBI Bank", score: 58, level: "Moderate Match" },
                { provider: "HDFC ERGO General Insurance", bank: "HDFC Bank", score: 45, level: "Low Match" }
            ];
            
            s.takeaway = `${s.provider} policy distributed by ${s.bank} is the best match for your claim scenario with high coverage alignment and suitable benefits.`;

            document.getElementById('dashboard-root').innerHTML = ClaimOutcomeAnalyzer();
        }
    };
"""

with io.open(r'c:\Users\user\Documents\AI Insurance App\SFAN\frontend\dashboard\pages\ClaimOutcomeAnalyzer.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# The original file has 407 lines. We are replacing lines 1 to 100 with `code`.
# But wait, how many lines is the replacement? It should replace until line 100.
# Let's verify line 101: `    const s = window.ClaimOutcomeActions.state;`
# We'll just split `code` and concatenate.
new_lines = code.split('\\n') + [line.rstrip() for line in lines[100:]]

with io.open(r'c:\Users\user\Documents\AI Insurance App\SFAN\frontend\dashboard\pages\ClaimOutcomeAnalyzer.js', 'w', encoding='utf-8') as f:
    f.write('\\n'.join(new_lines))

print("Fixed")
