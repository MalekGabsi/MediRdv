import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';

// Entirely live HTTP/CORS checks. Artifacts are excluded from Git.
const browser = await chromium.launch({ channel: 'chrome', args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 1440, height: 1040 } });
const errors = []; page.on('pageerror', error => errors.push(error.message));
try {
  await mkdir('artifacts', { recursive: true });
  await page.goto('http://localhost:3006/');
  await page.getByText('FHIR 4.0.1 vérifié', { exact: false }).waitFor({ timeout: 30000 });
  await page.screenshot({ path: 'artifacts/accueil.png', fullPage: true });
  await page.getByRole('button', { name: 'Patients avec rendez-vous' }).click();
  await page.getByRole('button', { name: /Sélectionner ce patient/ }).first().waitFor({ timeout: 30000 });
  const choices = await page.getByRole('button', { name: /Sélectionner ce patient/ }).count();
  let success = false;
  for (let candidate = 0; candidate < Math.min(choices, 8) && !success; candidate++) {
    if (candidate > 0) {
      await page.getByRole('button', { name: 'Changer de patient' }).click();
      await page.getByRole('button', { name: 'Patients avec rendez-vous' }).click();
      await page.getByRole('button', { name: /Sélectionner ce patient/ }).nth(candidate).waitFor({ timeout: 30000 });
    }
    await page.getByRole('button', { name: /Sélectionner ce patient/ }).nth(candidate).click();
    await page.getByRole('button', { name: /^Voir le rendez-vous / }).first().waitFor({ timeout: 30000 });
    await page.getByRole('combobox', { name: 'Filtrer les rendez-vous' }).selectOption('booked');
    const rows = await page.getByRole('button', { name: /^Voir le rendez-vous / }).count();
    for (let appointment = 0; appointment < Math.min(rows, 4) && !success; appointment++) {
      await page.getByRole('button', { name: /^Voir le rendez-vous / }).nth(appointment).click();
      await page.getByRole('button', { name: 'Préparer la conversion' }).waitFor({ timeout: 30000 });
      await page.screenshot({ path: 'artifacts/rendez-vous.png', fullPage: true });
      await page.getByRole('button', { name: 'Préparer la conversion' }).click();
      await page.getByRole('checkbox').check();
      await page.getByRole('button', { name: 'Générer le message HL7' }).click();
      if (await page.getByLabel('Message HL7 généré').count()) {
        const text = await page.getByLabel('Message HL7 généré').innerText();
        assert(text.includes('SIU^S12^SIU_S12')); success = true;
        await page.screenshot({ path: 'artifacts/conversion.png', fullPage: true });
        await page.getByRole('button', { name: 'Terminologies', exact: true }).click();
        await page.screenshot({ path: 'artifacts/terminologies.png', fullPage: true });
      } else await page.getByRole('button', { name: 'Rendez-vous', exact: true }).click();
    }
  }
  assert(success, 'Aucun candidat disponible ne satisfaisait le profil local.');
  assert.deepEqual(errors, []);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: 'Changer de patient' }).click();
  await page.screenshot({ path: 'artifacts/mobile.png', fullPage: true });
  assert(!(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)), 'Débordement mobile');
  console.log('Live browser: real HAPI metadata, discovery, explicit selection, appointment details, SIU conversion and terminology passed; no page errors; mobile viewport passed.');
} finally { await browser.close(); }
