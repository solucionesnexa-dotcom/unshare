"use strict";
const caseId = "00000000-0000-4000-8000-000000000001";
const minorId = "00000000-0000-4000-8000-000000000004";
const normalizedVector = [0.1, 0.2, 0.3];
async function testFlow() {
    const loginResp = await fetch("http://localhost:3000/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            email: "guardian@example.com",
            password: "Password123!"
        })
    }).then(r => r.json());
    const token = loginResp.accessToken;
    console.log("✅ Authentication successful");
    const refResp = await fetch(`http://localhost:3000/api/v1/cases/${caseId}/face-references`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            minorId,
            referenceType: "image",
            normalizedVector,
            metadata: { source: "phone_upload", confidence: 0.95 }
        })
    }).then(r => r.json());
    if (refResp.id) {
        console.log("✅ Face reference created:", refResp.id);
    }
    else {
        console.error("❌ Face reference error:", refResp.message);
        return;
    }
    const scanResp = await fetch(`http://localhost:3000/api/v1/cases/${caseId}/findings/scan`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            faceReferenceId: refResp.id
        })
    }).then(r => r.json());
    if (scanResp.findings) {
        console.log("✅ Scan complete, findings with scores:");
        scanResp.findings.forEach(f => {
            console.log(`   - Platform: ${f.platform}, Risk: ${f.riskScore}, Match: ${f.matchScore}, Confidence: ${f.confidenceScore}`);
        });
    }
    else {
        console.error("❌ Scan error:", scanResp.message);
    }
    const findingsResp = await fetch(`http://localhost:3000/api/v1/cases/${caseId}/findings`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    }).then(r => r.json());
    if (Array.isArray(findingsResp)) {
        console.log("✅ Retrieved", findingsResp.length, "findings from case");
        findingsResp.forEach(f => {
            console.log(`   - ${f.platform}: matchScore=${f.matchScore}, confidenceScore=${f.confidenceScore}`);
        });
    }
    else {
        console.log("✅ Retrieved finding:", findingsResp.platform);
        console.log(`   - matchScore=${findingsResp.matchScore}, confidenceScore=${findingsResp.confidenceScore}`);
    }
}
testFlow().catch(console.error);
//# sourceMappingURL=test-e2e.js.map