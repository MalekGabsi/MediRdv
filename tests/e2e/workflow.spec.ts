import { expect, test } from '@playwright/test';
import { appointment, capability, location, patient, practitioner } from '../fixtures';

test.beforeEach(async ({ page }) => {
  await page.route('https://fonts.googleapis.com/**', route => route.abort());
  await page.route('https://hapi.fhir.org/baseR4/**', async route => {
    const url = new URL(route.request().url()); const path = url.pathname.replace('/baseR4/', '');
    const json = path === 'metadata' ? capability : path === 'Patient' ? { resourceType: 'Bundle', type: 'searchset', total: 2, entry: [{ resource: patient }, { resource: { ...patient, id: 'second', name: [{ family: 'Autre', given: ['Test'] }] } }] } : path === 'Appointment' ? { resourceType: 'Bundle', type: 'searchset', entry: [{ resource: appointment }, { resource: practitioner, search: { mode: 'include' } }, { resource: location, search: { mode: 'include' } }] } : {};
    await route.fulfill({ json, contentType: 'application/fhir+json' });
  });
});
test('explicit patient choice, appointment, sources, conversion and terminology', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto('/'); await expect(page.getByText('Serveur connecté', { exact: false })).toBeVisible();
  await page.getByRole('textbox', { name: 'Recherche patient' }).fill('Exemple'); await page.getByRole('button', { name: 'Rechercher', exact: true }).click();
  await expect(page.getByRole('button', { name: /Sélectionner ce patient/ })).toHaveCount(2); await expect(page.getByRole('region', { name: 'Patient sélectionné' })).toHaveCount(0);
  await page.getByRole('button', { name: /Alice Exemple/ }).click(); await expect(page.getByRole('region', { name: 'Patient sélectionné' })).toContainText('Alice Exemple');
  await page.getByRole('button', { name: 'Voir le rendez-vous test-appointment', exact: true }).click(); await expect(page.getByText('RENDEZ-VOUS SÉLECTIONNÉ', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Ressources FHIR', exact: true }).click(); await page.getByRole('button', { name: 'Appointment test-appointment' }).click(); await expect(page.getByLabel('Ressource FHIR source')).toContainText('TEST-A-1');
  await page.getByRole('button', { name: 'Conversion HL7', exact: true }).click(); const generate = page.getByRole('button', { name: 'Générer le message HL7' }); await expect(generate).toBeDisabled();
  await page.getByRole('checkbox').check(); await generate.click(); await expect(page.getByLabel('Message HL7 généré')).toContainText('SIU^S12^SIU_S12'); await expect(page.getByText('SUCCESS_WITH_WARNINGS', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Terminologies', exact: true }).click(); await expect(page.getByText('LOCAL-CONSULT', { exact: true })).toHaveCount(2);
  await page.getByRole('button', { name: 'Changer de patient' }).click(); await page.getByRole('button', { name: 'Conversion HL7', exact: true }).click(); await expect(page.getByText('Choisissez un rendez-vous')).toBeVisible(); await expect(page.getByLabel('Message HL7 généré')).toHaveCount(0); expect(errors).toEqual([]);
});
test('empty results are not technical errors, network errors offer retry', async ({ page }) => {
  await page.route('**/Patient?**', route => route.fulfill({ json: { resourceType: 'Bundle', type: 'searchset', total: 0 }, contentType: 'application/fhir+json' }));
  await page.goto('/'); await page.getByRole('textbox', { name: 'Recherche patient' }).fill('Absent'); await page.getByRole('button', { name: 'Rechercher', exact: true }).click(); await expect(page.getByText('Aucun patient trouvé', { exact: true })).toBeVisible(); await expect(page.getByRole('alert')).toHaveCount(0);
  await page.route('**/Patient?**', route => route.abort('failed')); await page.getByRole('button', { name: 'Rechercher', exact: true }).click(); await expect(page.getByRole('alert')).toContainText('Connexion au serveur FHIR impossible'); await expect(page.getByRole('button', { name: 'Réessayer' })).toBeVisible();
});
test('phone layout remains within the viewport', async ({ page }) => { await page.setViewportSize({ width: 390, height: 844 }); await page.goto('/'); await expect(page.getByRole('heading', { name: 'Rendez-vous patient' })).toBeVisible(); const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth); expect(overflow).toBe(false); });
test('a patient without appointments gets an empty state', async ({ page }) => {
  await page.route('**/Appointment?**', route => route.fulfill({ json: { resourceType: 'Bundle', type: 'searchset', total: 0 }, contentType: 'application/fhir+json' }));
  await page.goto('/'); await page.getByRole('textbox', { name: 'Recherche patient' }).fill('Exemple'); await page.getByRole('button', { name: 'Rechercher', exact: true }).click(); await page.getByRole('button', { name: /Alice Exemple/ }).click();
  await expect(page.getByRole('heading', { name: 'Aucun rendez-vous', exact: true })).toBeVisible(); await expect(page.getByRole('alert')).toHaveCount(0);
});
test('a missing required business identifier produces FAILED and no HL7 message', async ({ page }) => {
  await page.route('**/Appointment?**', route => route.fulfill({ json: { resourceType: 'Bundle', type: 'searchset', entry: [{ resource: { ...appointment, identifier: [] } }, { resource: practitioner, search: { mode: 'include' } }, { resource: location, search: { mode: 'include' } }] }, contentType: 'application/fhir+json' }));
  await page.goto('/'); await page.getByRole('textbox', { name: 'Recherche patient' }).fill('Exemple'); await page.getByRole('button', { name: 'Rechercher', exact: true }).click(); await page.getByRole('button', { name: /Alice Exemple/ }).click();
  await page.getByRole('button', { name: 'Voir le rendez-vous test-appointment' }).click(); await page.getByRole('button', { name: 'Préparer la conversion' }).click(); await page.getByRole('checkbox').check(); await page.getByRole('button', { name: 'Générer le message HL7' }).click();
  await expect(page.getByText('FAILED', { exact: true })).toBeVisible(); await expect(page.getByRole('alert')).toContainText('SCH-2'); await expect(page.getByLabel('Message HL7 généré')).toHaveCount(0); await expect(page.getByText('Aucun message n’a été produit.')).toBeVisible();
});
