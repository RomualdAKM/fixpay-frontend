import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Documentation API",
  description:
    "Documentation de l'API B2B FixPay : authentification HMAC, émission et gestion de cartes virtuelles, webhooks et catalogue d'erreurs.",
};

// Page publique reproduisant le guide d'intégration de l'API B2B marchand
// (source : backend docs/B2B_API_MARCHAND.md). Contenu converti depuis le
// markdown puis stylé avec les tokens de thème de l'app. Route hors RouteGuard
// et ajoutée aux PUBLIC_PATHS du middleware : accessible sans authentification.
const DOC_HTML = `
<style>
.doc-page{background:var(--color-bg);color:var(--color-text);min-height:100dvh;font-family:var(--font-dm-sans,var(--font-sans,system-ui,sans-serif));}
.doc-topbar{position:sticky;top:0;z-index:20;display:flex;align-items:center;justify-content:space-between;gap:16px;padding:14px clamp(16px,4vw,32px);background:color-mix(in srgb,var(--color-bg) 88%,transparent);backdrop-filter:blur(8px);border-bottom:1px solid var(--color-border);}
.doc-brand{font-weight:800;letter-spacing:-.3px;font-size:15px;color:var(--color-text);}
.doc-brand span{color:var(--color-text-muted);font-weight:600;}
.doc-back{font-size:13px;font-weight:600;color:var(--color-primary-light,var(--color-primary));text-decoration:none;}
.doc-back:hover{text-decoration:underline;}
.doc-shell{max-width:1120px;margin:0 auto;padding:clamp(24px,4vw,44px) clamp(16px,4vw,32px) 96px;}
@media(min-width:1024px){.doc-shell{display:grid;grid-template-columns:248px minmax(0,1fr);gap:56px;align-items:start;}}
.doc-toc{border:1px solid var(--color-border);background:var(--color-surface);border-radius:12px;padding:16px 18px;margin-bottom:28px;}
@media(min-width:1024px){.doc-toc{position:sticky;top:76px;margin-bottom:0;max-height:calc(100dvh - 100px);overflow-y:auto;}}
.doc-toc-title{margin:0 0 10px;font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--color-text-muted);}
.doc-toc ul{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:2px;}
.doc-toc a{display:block;padding:5px 8px;border-radius:7px;font-size:13px;line-height:1.35;color:var(--color-text-secondary);text-decoration:none;}
.doc-toc a:hover{background:var(--color-surface-2);color:var(--color-text);}
.doc-body{min-width:0;font-size:15px;line-height:1.7;color:var(--color-text-secondary);}
.doc-body h1{font-size:clamp(26px,4vw,34px);line-height:1.15;font-weight:800;letter-spacing:-.5px;color:var(--color-text);margin:0 0 8px;}
.doc-body h2{font-size:22px;font-weight:700;letter-spacing:-.3px;color:var(--color-text);margin:44px 0 14px;padding-top:12px;border-top:1px solid var(--color-border);}
.doc-body h3{font-size:17px;font-weight:700;color:var(--color-text);margin:28px 0 10px;}
.doc-body h1,.doc-body h2,.doc-body h3{scroll-margin-top:80px;position:relative;}
.doc-anchor{opacity:0;margin-left:8px;color:var(--color-text-muted);text-decoration:none;font-weight:400;}
.doc-body h1:hover .doc-anchor,.doc-body h2:hover .doc-anchor,.doc-body h3:hover .doc-anchor{opacity:1;}
.doc-body p{margin:0 0 14px;}
.doc-body a{color:var(--color-primary-light,var(--color-primary));text-decoration:none;}
.doc-body a:hover{text-decoration:underline;}
.doc-body strong{color:var(--color-text);font-weight:600;}
.doc-body ul,.doc-body ol{margin:0 0 14px;padding-left:22px;}
.doc-body li{margin:4px 0;}
.doc-body code{font-family:var(--font-dm-mono,var(--font-mono,ui-monospace,monospace));font-size:.86em;background:var(--color-surface-2);border:1px solid var(--color-border);padding:1px 5px;border-radius:5px;color:var(--color-text);}
.doc-body pre{background:var(--color-bg-raised,var(--color-surface));border:1px solid var(--color-border);border-radius:10px;padding:16px 18px;overflow-x:auto;margin:0 0 18px;line-height:1.55;}
.doc-body pre code{background:none;border:0;padding:0;font-size:13px;color:var(--color-text);}
.doc-body blockquote{margin:0 0 16px;padding:2px 16px;border-left:3px solid var(--color-primary);color:var(--color-text-muted);}
.doc-body hr{border:0;border-top:1px solid var(--color-border);margin:32px 0;}
.doc-tablewrap{overflow-x:auto;margin:0 0 18px;border:1px solid var(--color-border);border-radius:10px;}
.doc-body table{width:100%;border-collapse:collapse;font-size:13.5px;}
.doc-body th,.doc-body td{text-align:left;padding:9px 12px;border-bottom:1px solid var(--color-border);vertical-align:top;}
.doc-body th{background:var(--color-surface-2);color:var(--color-text);font-weight:600;white-space:nowrap;}
.doc-body tr:last-child td{border-bottom:0;}
</style><div class="doc-shell"><nav class="doc-toc" aria-label="Sommaire"><p class="doc-toc-title">Sommaire</p><ul><li><a href="#1-introduction">1. Introduction</a></li><li><a href="#2-prise-en-main-prerequis">2. Prise en main / prérequis</a></li><li><a href="#3-base-url-amp-environnements">3. Base URL &amp; environnements</a></li><li><a href="#4-authentification-hmac-le-c-ur">4. Authentification HMAC (le cœur)</a></li><li><a href="#5-reference-des-endpoints">5. Référence des endpoints</a></li><li><a href="#6-enveloppe-de-reponse-amp-catalogue-d-39-erreurs">6. Enveloppe de réponse &amp; catalogue d&#39;erreurs</a></li><li><a href="#7-idempotence-post-cards">7. Idempotence (POST /cards)</a></li><li><a href="#8-limites-de-debit">8. Limites de débit</a></li><li><a href="#9-webhooks-implemente-et-actif">9. Webhooks (implémenté et actif)</a></li></ul></nav><article class="doc-body"><h1 id="fixpay-guide-d-39-integration-de-l-39-api-b2b-marchand">FixPay — Guide d&#39;intégration de l&#39;API B2B Marchand<a class="doc-anchor" href="#fixpay-guide-d-39-integration-de-l-39-api-b2b-marchand" aria-label="Lien vers cette section">#</a></h1>
<blockquote>
<p>Version : rédigée à partir du code du backend Laravel FixPay. Tout élément absent
du code est signalé explicitement par la mention <strong>« non présent dans le code »</strong>
ou <strong>« ambigu »</strong>. Ne vous fiez à aucune valeur non citée ici.</p>
</blockquote>
<hr>
<h2 id="1-introduction">1. Introduction<a class="doc-anchor" href="#1-introduction" aria-label="Lien vers cette section">#</a></h2>
<p>L&#39;API B2B FixPay permet à un marchand d&#39;<strong>émettre et de gérer des cartes virtuelles
libellées en USD</strong> par des appels <strong>serveur-à-serveur</strong>, authentifiés par signature
<strong>HMAC-SHA256</strong>.</p>
<p>Six opérations sont exposées au marchand :</p>
<div class="doc-tablewrap"><table>
<thead>
<tr>
<th>Opération</th>
<th>Méthode + chemin</th>
</tr>
</thead>
<tbody><tr>
<td>Émettre une carte</td>
<td><code>POST /api/b2b/cards</code></td>
</tr>
<tr>
<td>Consulter une carte</td>
<td><code>GET /api/b2b/cards/{uuid}</code></td>
</tr>
<tr>
<td>Révéler les données sensibles (PAN/CVV)</td>
<td><code>POST /api/b2b/cards/{uuid}/reveal</code></td>
</tr>
<tr>
<td>Geler une carte</td>
<td><code>POST /api/b2b/cards/{uuid}/freeze</code></td>
</tr>
<tr>
<td>Débloquer une carte</td>
<td><code>POST /api/b2b/cards/{uuid}/unfreeze</code></td>
</tr>
<tr>
<td>Annuler une carte</td>
<td><code>POST /api/b2b/cards/{uuid}/cancel</code></td>
</tr>
</tbody></table></div>
<p>Ces appels sont <strong>strictement serveur-à-serveur</strong> : ils exigent votre <strong>secret HMAC</strong>,
qui ne doit jamais transiter côté client (navigateur, application mobile). Toute la
surface marchand se limite à ces 6 endpoints ; il n&#39;existe <strong>aucun endpoint de
self-service</strong> (création de compte, gestion de clés, approvisionnement du wallet) —
ces opérations sont réalisées par l&#39;équipe FixPay (voir §2).</p>
<p>Points structurants à retenir dès maintenant :</p>
<ul>
<li>La carte est libellée en <strong>USD</strong>, mais votre <strong>wallet est débité en XOF</strong> (modèle
prépayé). Vous devez approvisionner votre wallet XOF avant d&#39;émettre.</li>
<li>L&#39;émission est <strong>asynchrone</strong> côté fournisseur : la réponse <code>201</code> confirme la prise
en compte de l&#39;ordre, <strong>pas</strong> nécessairement la disponibilité immédiate de la carte
(voir §5.1).</li>
</ul>
<hr>
<h2 id="2-prise-en-main-prerequis">2. Prise en main / prérequis<a class="doc-anchor" href="#2-prise-en-main-prerequis" aria-label="Lien vers cette section">#</a></h2>
<p>Toutes les opérations d&#39;approvisionnement décrites ici sont réalisées <strong>par
l&#39;administrateur FixPay</strong>, pas par vous. Elles sont listées pour que vous compreniez
ce que vous recevez.</p>
<h3 id="2-1-obtention-des-identifiants">2.1 Obtention des identifiants<a class="doc-anchor" href="#2-1-obtention-des-identifiants" aria-label="Lien vers cette section">#</a></h3>
<p>Lors de l&#39;émission d&#39;une clé API par FixPay, vous recevez <strong>une seule fois</strong> :</p>
<ul>
<li><strong><code>public_key</code></strong> — préfixe littéral <code>pk_</code> suivi de 32 caractères hexadécimaux
minuscules (ex. <code>pk_ab12...</code>). Elle est transmise en clair dans l&#39;en-tête
<code>X-FixPay-Key</code>. Source : <code>ApiKeyService.php:26-28</code>.</li>
<li><strong><code>secret</code></strong> — 64 caractères hexadécimaux. C&#39;est la <strong>clé HMAC</strong> utilisée pour
signer vos requêtes. Source : <code>ApiKeyService.php:26-28</code>.</li>
<li><strong><code>webhook_secret</code></strong> — 64 caractères hexadécimaux. Sert <strong>uniquement</strong> à vérifier
la signature des <strong>webhooks entrants</strong> que FixPay vous enverra (voir §9). Source :
<code>ApiKeyService.php:26-28</code>.</li>
</ul>
<blockquote>
<p><strong>Le <code>secret</code> et le <code>webhook_secret</code> ne sont affichés qu&#39;une seule fois</strong>, au moment
de l&#39;émission de la clé (réponse admin, en-têtes <code>Cache-Control: no-store</code>).
FixPay les stocke <strong>chiffrés au repos</strong> (AES-256-GCM) et <strong>ne peut pas les
ré-afficher</strong>. Stockez-les immédiatement dans un coffre. La seule façon d&#39;en obtenir
de nouveaux est d&#39;<strong>émettre une nouvelle clé</strong>. Source : <code>B2bMerchantController.php:107-116</code>,
<code>ApiKeyService.php:35-37</code>, <code>B2bApiKeyResource.php:21-29</code>.</p>
</blockquote>
<p><strong>Rotation / révocation.</strong> La rotation se fait en <strong>deux temps côté FixPay</strong> : émettre
une nouvelle clé, puis révoquer l&#39;ancienne. Plusieurs clés <code>active</code> peuvent coexister
pour un même marchand. Une clé révoquée ou expirée entraîne un <code>401</code> sur tous vos
appels. Source : <code>ApiKeyService.php:53-80</code>, <code>VerifyB2bHmac.php:39-46</code>.</p>
<h3 id="2-2-approvisionnement-du-wallet-modele-prepaye">2.2 Approvisionnement du wallet (modèle prépayé)<a class="doc-anchor" href="#2-2-approvisionnement-du-wallet-modele-prepaye" aria-label="Lien vers cette section">#</a></h3>
<p>L&#39;émission de carte <strong>débite votre wallet marchand en XOF</strong>. Vous devez donc être
<strong>pré-financé</strong> avant d&#39;émettre.</p>
<ul>
<li>Le wallet est un <strong>compte de grand livre (ledger)</strong> en <strong>XOF</strong> — pas une simple
colonne de solde. Source : <code>InitiateB2bCardIssuance.php:87-97</code>, <code>B2bMerchantResource.php:34,45</code>.</li>
<li>L&#39;approvisionnement est effectué par FixPay (double contrôle / approbation) en XOF
uniquement. Source : <code>CreditMerchantWallet.php:40-42</code>, <code>CreditMerchantWalletRequest.php:24</code>.</li>
<li>À l&#39;émission, le montant <code>client_price</code> (calculé par FixPay selon le BIN) est débité
de votre wallet. Un solde insuffisant fait échouer l&#39;émission avec le code
<code>insufficient_balance</code> (HTTP 422). Source : <code>InitiateB2bCardIssuance.php:87-97</code>,
<code>bootstrap/app.php:134-138</code>.</li>
</ul>
<h3 id="2-3-notion-de-bin">2.3 Notion de BIN<a class="doc-anchor" href="#2-3-notion-de-bin" aria-label="Lien vers cette section">#</a></h3>
<p>Un <strong>BIN</strong> identifie le programme de carte utilisé pour l&#39;émission.</p>
<ul>
<li>Vous référencez un BIN par son <strong><code>bin_uuid</code></strong> (identifiant UUID public), <strong>pas</strong> par
le numéro de BIN brut. Source : <code>Bin.php:12-23</code>, <code>IssueB2bCardRequest.php:23-27</code>.</li>
<li>Le <code>bin_uuid</code> est <strong>optionnel</strong> dans la requête. S&#39;il est absent, FixPay utilise le
<strong>BIN par défaut</strong> configuré pour votre compte. Si ni l&#39;un ni l&#39;autre n&#39;est
disponible (ou si le BIN n&#39;est pas activé côté FixPay), l&#39;émission échoue en <code>422</code>
<code>bin_required</code>. Source : <code>B2bCardController.php:95-108, 44-46</code>.</li>
</ul>
<h3 id="2-4-statuts">2.4 Statuts<a class="doc-anchor" href="#2-4-statuts" aria-label="Lien vers cette section">#</a></h3>
<p><strong>Statut de carte</strong> (<code>status</code>) — <code>CardStatus.php:7-13</code> : <code>pending</code>, <code>active</code>,
<code>frozen</code>, <code>cancelled</code>.</p>
<p><strong>État de l&#39;ordre d&#39;émission</strong> (<code>state</code>) — <code>CardIssuanceState.php:7-12</code> : <code>pending</code>,
<code>success</code>, <code>failed</code>.</p>
<p><strong>Devises</strong> — <code>Currency.php:7-19</code> : <code>XOF</code> (échelle 0), <code>USD</code> (échelle 2).</p>
<hr>
<h2 id="3-base-url-amp-environnements">3. Base URL &amp; environnements<a class="doc-anchor" href="#3-base-url-amp-environnements" aria-label="Lien vers cette section">#</a></h2>
<p>Le <strong>domaine / hôte de base</strong> (ex. <code>https://api.fixpay...</code>) <strong>n&#39;est pas présent dans le
code</strong> examiné. Il doit vous être communiqué par FixPay pour chaque environnement.</p>
<p>Ce qui <strong>est</strong> garanti par le code, c&#39;est le <strong>chemin</strong> : les routes marchand sont
montées sous le préfixe API par défaut de Laravel (<code>api</code>) puis le groupe <code>b2b</code>, soit :</p>
<ul>
<li><code>POST /api/b2b/cards</code></li>
<li><code>GET /api/b2b/cards/{uuid}</code></li>
<li><code>POST /api/b2b/cards/{uuid}/reveal</code></li>
</ul>
<p>Source : <code>routes/api.php:52-55</code>, <code>bootstrap/app.php:42-50</code> (aucun <code>apiPrefix</code>
personnalisé → préfixe <code>api</code> par défaut).</p>
<blockquote>
<p><strong>Point critique pour la signature</strong> : le segment <code>/api</code> <strong>fait partie</strong> de la valeur
signée (<code>requestUri</code>). Voir §4.3.</p>
</blockquote>
<p><strong>Prérequis d&#39;intégration</strong> : envoyez toujours l&#39;en-tête <code>Accept: application/json</code>.
Sans cela, certaines erreurs rendues par le framework (validation, 404, 429) peuvent
ne pas être retournées en JSON. Ce point découle du comportement par défaut de Laravel
(négociation de contenu), pas d&#39;une ligne explicite du projet.</p>
<hr>
<h2 id="4-authentification-hmac-le-c-ur">4. Authentification HMAC (le cœur)<a class="doc-anchor" href="#4-authentification-hmac-le-c-ur" aria-label="Lien vers cette section">#</a></h2>
<p>Chaque requête aux 3 endpoints doit porter une signature HMAC-SHA256. Le middleware
<code>VerifyB2bHmac</code> vérifie, <strong>dans cet ordre</strong> (le premier échec l&#39;emporte) :</p>
<ol>
<li>présence des 4 en-têtes ;</li>
<li>clé publique connue, <code>active</code>, non expirée ;</li>
<li>marchand <code>active</code> ;</li>
<li><strong>signature valide</strong> ;</li>
<li><strong>timestamp dans la fenêtre</strong> ;</li>
<li><strong>nonce non déjà utilisé</strong>.</li>
</ol>
<p>Source : <code>VerifyB2bHmac.php:26-80</code>.</p>
<h3 id="4-1-les-4-en-tetes-d-39-authentification">4.1 Les 4 en-têtes d&#39;authentification<a class="doc-anchor" href="#4-1-les-4-en-tetes-d-39-authentification" aria-label="Lien vers cette section">#</a></h3>
<div class="doc-tablewrap"><table>
<thead>
<tr>
<th>En-tête</th>
<th>Rôle</th>
<th>Source</th>
</tr>
</thead>
<tbody><tr>
<td><code>X-FixPay-Key</code></td>
<td>Votre <code>public_key</code></td>
<td><code>config/b2b.php:13</code></td>
</tr>
<tr>
<td><code>X-FixPay-Signature</code></td>
<td>Signature HMAC-SHA256 (hex minuscule)</td>
<td><code>config/b2b.php:14</code></td>
</tr>
<tr>
<td><code>X-FixPay-Timestamp</code></td>
<td>Timestamp Unix en <strong>secondes</strong>, entier</td>
<td><code>config/b2b.php:15</code></td>
</tr>
<tr>
<td><code>X-FixPay-Nonce</code></td>
<td>Valeur unique par requête (par clé)</td>
<td><code>config/b2b.php:16</code></td>
</tr>
</tbody></table></div>
<p>Chaque en-tête est lu puis <code>trim</code>. Si l&#39;un des 4 est vide → <code>401 unauthorized</code>.
Source : <code>VerifyB2bHmac.php:30-37</code>.</p>
<h3 id="4-2-construction-de-la-chaine-canonique-pas-a-pas">4.2 Construction de la chaîne canonique (pas-à-pas)<a class="doc-anchor" href="#4-2-construction-de-la-chaine-canonique-pas-a-pas" aria-label="Lien vers cette section">#</a></h3>
<p>La chaîne à signer est l&#39;<strong>assemblage de 5 éléments, joints par un unique saut de
ligne <code>\\n</code> (LF), sans saut de ligne final</strong> :</p>
<pre><code>&lt;MÉTHODE en MAJUSCULES&gt;\\n
&lt;requestUri&gt;\\n
&lt;timestamp&gt;\\n
&lt;nonce&gt;\\n
&lt;SHA-256 hex du corps brut&gt;
</code></pre>
<p>Source unique : <code>HmacVerifier::canonical()</code> — <code>HmacVerifier.php:11-25</code>.</p>
<p>Règles exactes :</p>
<ol>
<li><p><strong>Méthode</strong> : passée en <code>strtoupper()</code> → <code>POST</code> ou <code>GET</code>. (<code>HmacVerifier.php:19</code>)</p>
</li>
<li><p><strong>requestUri</strong> : voir §4.3. (<code>HmacVerifier.php:20</code>, <code>VerifyB2bHmac.php:56</code>)</p>
</li>
<li><p><strong>timestamp</strong> : la valeur brute (trim) de l&#39;en-tête <code>X-FixPay-Timestamp</code>.
(<code>HmacVerifier.php:21</code>)</p>
</li>
<li><p><strong>nonce</strong> : la valeur brute (trim) de l&#39;en-tête <code>X-FixPay-Nonce</code>.
(<code>HmacVerifier.php:22</code>)</p>
</li>
<li><p><strong>hash du corps</strong> : <code>hash(&#39;sha256&#39;, corps_brut)</code> → <strong>digest SHA-256 en hexadécimal
minuscule</strong> du corps <strong>brut</strong> de la requête (les octets exacts envoyés). Ce n&#39;est
<strong>pas</strong> le corps lui-même qui est inséré, mais son empreinte hex.
(<code>HmacVerifier.php:23</code>, <code>VerifyB2bHmac.php:59</code>)</p>
<p>Pour un <strong>corps vide</strong> (typiquement <code>GET</code> et <code>reveal</code>), le digest est celui de la
chaîne vide :
<code>e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855</code>.</p>
</li>
</ol>
<h3 id="4-3-valeur-exacte-de-requesturi">4.3 Valeur EXACTE de <code>requestUri</code><a class="doc-anchor" href="#4-3-valeur-exacte-de-requesturi" aria-label="Lien vers cette section">#</a></h3>
<p><code>requestUri</code> = <code>$request-&gt;getRequestUri()</code>, c&#39;est-à-dire <strong>le chemin exact envoyé sur
le fil</strong>, préfixe <code>/api</code> <strong>inclus</strong>, et <strong>query string incluse si présente</strong>, sans
normalisation ni décodage. Source : <code>VerifyB2bHmac.php:56</code>.</p>
<p>Concrètement, la valeur à signer est :</p>
<ul>
<li><code>/api/b2b/cards</code> pour l&#39;émission ;</li>
<li><code>/api/b2b/cards/&lt;uuid&gt;</code> pour la consultation (le <code>{uuid}</code> tel qu&#39;écrit dans l&#39;URL) ;</li>
<li><code>/api/b2b/cards/&lt;uuid&gt;/reveal</code> pour la révélation.</li>
</ul>
<p>Si vous ajoutez une query string (ex. <code>/api/b2b/cards/abc-123?foo=bar</code>), elle <strong>fait
partie</strong> de la valeur signée.</p>
<blockquote>
<p><strong>Ambiguïté à respecter</strong> : <code>getRequestUri()</code> renvoie l&#39;URI <strong>telle que reçue</strong> (mêmes
encodages de caractères, même casse de chemin). Signez <strong>exactement</strong> la forme
réellement transmise dans la ligne de requête HTTP, sinon la comparaison échoue.</p>
</blockquote>
<h3 id="4-4-calcul-de-la-signature">4.4 Calcul de la signature<a class="doc-anchor" href="#4-4-calcul-de-la-signature" aria-label="Lien vers cette section">#</a></h3>
<pre><code>signature = hash_hmac(&#39;sha256&#39;, chaîne_canonique, secret)   // hex minuscule
</code></pre>
<ul>
<li>Algorithme : <strong>HMAC-SHA256</strong>, sortie <strong>hexadécimale minuscule</strong> (pas de binaire).</li>
<li>Clé : votre <code>secret</code> (64 hex reçu à l&#39;émission).</li>
<li>La signature complète est comparée en <strong>temps constant</strong> (<code>hash_equals</code>) — elle n&#39;est
jamais tronquée.</li>
</ul>
<p>Source : <code>HmacVerifier.php:27-38</code>.</p>
<h3 id="4-5-regles-du-timestamp">4.5 Règles du timestamp<a class="doc-anchor" href="#4-5-regles-du-timestamp" aria-label="Lien vers cette section">#</a></h3>
<ul>
<li>Format : <strong>timestamp Unix en secondes, entier</strong> (validé par <code>^-?\\d+$</code>). Pas de
millisecondes, pas d&#39;ISO-8601.</li>
<li>Fenêtre : la requête est acceptée si <code>abs(now - timestamp) &lt;= 300</code> secondes.
Tolérance <strong>symétrique</strong> (±300 s), pilotable par FixPay via
<code>B2B_REPLAY_WINDOW_SECONDS</code> (défaut 300).</li>
<li>Hors fenêtre ou non entier → <code>401 unauthorized</code>.</li>
</ul>
<p>Source : <code>HmacVerifier.php:40-55</code>, <code>config/b2b.php:6</code>.</p>
<h3 id="4-6-regles-du-nonce">4.6 Règles du nonce<a class="doc-anchor" href="#4-6-regles-du-nonce" aria-label="Lien vers cette section">#</a></h3>
<ul>
<li>Valeur <strong>unique par requête</strong>, scopée à votre clé API (l&#39;unicité porte sur le couple
<code>(api_key_id, nonce)</code>).</li>
<li>Un nonce <strong>déjà vu</strong> pour votre clé → <strong><code>409 replay_detected</code></strong> (et non 401).</li>
<li>Le nonce n&#39;est vérifié qu&#39;<strong>après</strong> une signature et un timestamp valides.</li>
<li>Durée de rétention (TTL) côté FixPay : <code>max(B2B_NONCE_TTL_SECONDS [défaut 900], 2 × fenêtre de rejeu)</code> = <strong>900 s</strong> avec les valeurs par défaut.
Un même nonce ne peut donc pas être rejoué pendant au moins toute la fenêtre
d&#39;acceptation.</li>
</ul>
<p>Recommandation : utilisez un UUID v4 par requête.</p>
<p>Source : <code>VerifyB2bHmac.php:82-102, 130-133</code>, <code>config/b2b.php:8</code>.</p>
<h3 id="4-7-en-tete-idempotency-key-post-cards-uniquement">4.7 En-tête <code>Idempotency-Key</code> (POST /cards uniquement)<a class="doc-anchor" href="#4-7-en-tete-idempotency-key-post-cards-uniquement" aria-label="Lien vers cette section">#</a></h3>
<p>En <strong>plus</strong> des 4 en-têtes HMAC, <code>POST /api/b2b/cards</code> <strong>exige</strong> l&#39;en-tête
<code>Idempotency-Key</code>. Il <strong>ne fait PAS partie de la chaîne canonique HMAC</strong> — c&#39;est un
en-tête applicatif distinct (voir §7).</p>
<ul>
<li>Obligatoire ; doit respecter la regex <code>^[A-Za-z0-9_.:-]{1,128}$</code>.</li>
<li>Absent/vide → <code>422 idempotency_key_required</code>. Invalide → <code>422 idempotency_key_invalid</code>.</li>
</ul>
<p>Source : <code>B2bCardController.php:32-40, 133-136</code>.</p>
<h3 id="4-8-exemple-complet-shell-curl-openssl">4.8 Exemple complet — shell / curl + openssl<a class="doc-anchor" href="#4-8-exemple-complet-shell-curl-openssl" aria-label="Lien vers cette section">#</a></h3>
<pre><code class="language-bash">#!/usr/bin/env bash
set -euo pipefail

SECRET=&quot;votre_secret_64_hex&quot;          # reçu une seule fois
PUBLIC_KEY=&quot;pk_votre_cle_publique&quot;
BASE_URL=&quot;https://&lt;hote-fourni-par-fixpay&gt;&quot;   # non présent dans le code

METHOD=&quot;POST&quot;
REQUEST_URI=&quot;/api/b2b/cards&quot;          # /api INCLUS — voir §4.3
BODY=&#39;{&quot;cardholder_name&quot;:&quot;Awa Diop&quot;}&#39; # corps brut EXACT qui sera envoyé
TIMESTAMP=&quot;$(date +%s)&quot;               # secondes Unix, entier
NONCE=&quot;$(uuidgen)&quot;                    # unique par requête

# 1) SHA-256 hex du corps brut
BODY_HASH=&quot;$(printf &#39;%s&#39; &quot;$BODY&quot; | openssl dgst -sha256 -hex | awk &#39;{print $NF}&#39;)&quot;

# 2) Chaîne canonique : 5 éléments joints par \\n, SANS \\n final
CANONICAL=&quot;$(printf &#39;%s\\n%s\\n%s\\n%s\\n%s&#39; &quot;$METHOD&quot; &quot;$REQUEST_URI&quot; &quot;$TIMESTAMP&quot; &quot;$NONCE&quot; &quot;$BODY_HASH&quot;)&quot;

# 3) Signature HMAC-SHA256 hex
SIGNATURE=&quot;$(printf &#39;%s&#39; &quot;$CANONICAL&quot; | openssl dgst -sha256 -hmac &quot;$SECRET&quot; -hex | awk &#39;{print $NF}&#39;)&quot;

# 4) Requête — le corps envoyé (--data) DOIT être identique à $BODY
curl -sS -X &quot;$METHOD&quot; &quot;$BASE_URL$REQUEST_URI&quot; \\
  -H &quot;X-FixPay-Key: $PUBLIC_KEY&quot; \\
  -H &quot;X-FixPay-Signature: $SIGNATURE&quot; \\
  -H &quot;X-FixPay-Timestamp: $TIMESTAMP&quot; \\
  -H &quot;X-FixPay-Nonce: $NONCE&quot; \\
  -H &quot;Idempotency-Key: $(uuidgen)&quot; \\
  -H &quot;Content-Type: application/json&quot; \\
  -H &quot;Accept: application/json&quot; \\
  --data &quot;$BODY&quot;
</code></pre>
<blockquote>
<p>Le corps haché (<code>$BODY</code>) et le corps envoyé (<code>--data</code>) doivent être <strong>strictement
identiques, octet pour octet</strong>. N&#39;utilisez pas d&#39;outil qui reformate le JSON entre le
hachage et l&#39;envoi.</p>
</blockquote>
<h3 id="4-9-exemple-complet-python">4.9 Exemple complet — Python<a class="doc-anchor" href="#4-9-exemple-complet-python" aria-label="Lien vers cette section">#</a></h3>
<pre><code class="language-python">import hashlib, hmac, time, uuid, json
import requests  # pip install requests

SECRET = &quot;votre_secret_64_hex&quot;        # reçu une seule fois
PUBLIC_KEY = &quot;pk_votre_cle_publique&quot;
BASE_URL = &quot;https://&lt;hote-fourni-par-fixpay&gt;&quot;   # non présent dans le code

method = &quot;POST&quot;
request_uri = &quot;/api/b2b/cards&quot;        # /api INCLUS — voir §4.3

# Corps brut EXACT en OCTETS : sérialisé une seule fois en bytes, puis réutilisé
# tel quel pour le hachage ET l&#39;envoi — garantit octets signés == octets transmis
# quel que soit le contenu (json.dumps échappe le non-ASCII par défaut).
body = json.dumps({&quot;cardholder_name&quot;: &quot;Awa Diop&quot;}, separators=(&quot;,&quot;, &quot;:&quot;)).encode(&quot;utf-8&quot;)

timestamp = str(int(time.time()))     # secondes Unix, entier
nonce = str(uuid.uuid4())             # unique par requête

# 1) SHA-256 hex du corps brut (les octets exacts qui seront envoyés)
body_hash = hashlib.sha256(body).hexdigest()

# 2) Chaîne canonique : 5 éléments joints par &quot;\\n&quot;, sans &quot;\\n&quot; final
canonical = &quot;\\n&quot;.join([method.upper(), request_uri, timestamp, nonce, body_hash])

# 3) Signature HMAC-SHA256 hex
signature = hmac.new(
    SECRET.encode(&quot;utf-8&quot;), canonical.encode(&quot;utf-8&quot;), hashlib.sha256
).hexdigest()

headers = {
    &quot;X-FixPay-Key&quot;: PUBLIC_KEY,
    &quot;X-FixPay-Signature&quot;: signature,
    &quot;X-FixPay-Timestamp&quot;: timestamp,
    &quot;X-FixPay-Nonce&quot;: nonce,
    &quot;Idempotency-Key&quot;: str(uuid.uuid4()),
    &quot;Content-Type&quot;: &quot;application/json&quot;,
    &quot;Accept&quot;: &quot;application/json&quot;,
}

# 4) IMPORTANT : envoyer la MÊME chaîne brute (data=body), pas json=...
resp = requests.post(BASE_URL + request_uri, data=body, headers=headers)
print(resp.status_code, resp.json())
</code></pre>
<blockquote>
<p>Pour un <code>GET</code> ou un <code>reveal</code> sans corps, <code>body = b&quot;&quot;</code> : le hash du corps devient
<code>e3b0c442...b855</code> et vous n&#39;envoyez pas de <code>--data</code>/<code>data</code>.</p>
</blockquote>
<hr>
<h2 id="5-reference-des-endpoints">5. Référence des endpoints<a class="doc-anchor" href="#5-reference-des-endpoints" aria-label="Lien vers cette section">#</a></h2>
<p>Rappel : les 4 en-têtes HMAC (§4.1) sont requis sur <strong>les trois</strong> endpoints. Seul
<code>POST /cards</code> exige en plus <code>Idempotency-Key</code>.</p>
<h3 id="5-1-post-api-b2b-cards-emission-d-39-une-carte">5.1 <code>POST /api/b2b/cards</code> — Émission d&#39;une carte<a class="doc-anchor" href="#5-1-post-api-b2b-cards-emission-d-39-une-carte" aria-label="Lien vers cette section">#</a></h3>
<p><strong>En-têtes</strong> : 4 en-têtes HMAC + <code>Idempotency-Key</code> (obligatoire).</p>
<p><strong>Corps de requête</strong> (<code>IssueB2bCardRequest.php:20-31</code>) :</p>
<div class="doc-tablewrap"><table>
<thead>
<tr>
<th>Champ</th>
<th>Requis</th>
<th>Contraintes</th>
</tr>
</thead>
<tbody><tr>
<td><code>bin_uuid</code></td>
<td>optionnel (<code>nullable</code>)</td>
<td><code>uuid</code> ; doit exister dans les BIN où <code>fixpay_enabled = true</code></td>
</tr>
<tr>
<td><code>cardholder_name</code></td>
<td><strong>requis</strong></td>
<td><code>string</code>, <code>max:255</code></td>
</tr>
<tr>
<td><code>cardholder_email</code></td>
<td>optionnel (<code>nullable</code>)</td>
<td><code>email</code>, <code>max:255</code></td>
</tr>
</tbody></table></div>
<p><strong>Exemple de requête</strong> :</p>
<pre><code class="language-http">POST /api/b2b/cards HTTP/1.1
Host: &lt;hote-fourni-par-fixpay&gt;
X-FixPay-Key: pk_...
X-FixPay-Signature: &lt;hex&gt;
X-FixPay-Timestamp: 1755253350
X-FixPay-Nonce: 7c3d...-uuid
Idempotency-Key: order-2026-08-15-0001
Content-Type: application/json
Accept: application/json

{&quot;cardholder_name&quot;:&quot;Awa Diop&quot;,&quot;cardholder_email&quot;:&quot;awa@example.com&quot;}
</code></pre>
<p><strong>Réponse de succès</strong> : <strong>HTTP 201</strong>, <code>message = &quot;b2b_card_issuance_initiated&quot;</code>,
<code>data = B2bCardIssuanceOrderResource</code>. Source : <code>B2bCardController.php:57-61</code>,
<code>B2bCardIssuanceOrderResource.php:22-36</code>.</p>
<pre><code class="language-json">{
  &quot;message&quot;: &quot;b2b_card_issuance_initiated&quot;,
  &quot;data&quot;: {
    &quot;uuid&quot;: &quot;b1f2c3d4-5678-4abc-9def-0123456789ab&quot;,
    &quot;state&quot;: &quot;pending&quot;,
    &quot;client_price&quot;: { &quot;amount_minor&quot;: 6500, &quot;currency&quot;: &quot;XOF&quot;, &quot;scale&quot;: 0 },
    &quot;card&quot;: null,
    &quot;cardholder_name&quot;: &quot;Awa Diop&quot;,
    &quot;cardholder_email&quot;: &quot;awa@example.com&quot;,
    &quot;failure_reason&quot;: null,
    &quot;created_at&quot;: &quot;2026-08-15T10:22:30+00:00&quot;
  },
  &quot;errors&quot;: null
}
</code></pre>
<p>Points essentiels à comprendre (comportements réels du code) :</p>
<ul>
<li><strong>HTTP 201 est toujours renvoyé</strong>, même si l&#39;ordre finit en <code>state = &quot;failed&quot;</code>.
Vérifiez donc <strong><code>data.state</code></strong> et <strong><code>data.failure_reason</code></strong>. Source :
<code>B2bCardController.php:57-61</code>.</li>
<li><strong><code>data.card</code> vaut <code>null</code> à l&#39;émission</strong> : la carte est créée/activée de façon
<strong>asynchrone</strong>. L&#39;<code>uuid</code> de la carte n&#39;est pas disponible dans cette réponse. Le
suivi de la création (jusqu&#39;à obtenir la carte) se fait via <strong>webhook</strong> (§9) ou par
re-consultation ultérieure. Source : <code>B2bCardIssuanceOrderResource.php:30</code>,
<code>InitiateB2bCardIssuance.php</code> (persist sans <code>card_id</code>).</li>
<li><strong><code>client_price.currency</code> est codé en dur <code>XOF</code></strong> : c&#39;est le montant débité de votre
wallet, indépendamment de la devise <code>USD</code> de la carte. Source :
<code>B2bCardIssuanceOrderResource.php:29</code>.</li>
</ul>
<p>Champs de <code>data</code> (émission) — <code>B2bCardIssuanceOrderResource.php:22-36</code> :</p>
<div class="doc-tablewrap"><table>
<thead>
<tr>
<th>Champ</th>
<th>Type</th>
<th>Notes</th>
</tr>
</thead>
<tbody><tr>
<td><code>uuid</code></td>
<td>string</td>
<td>UUID de l&#39;<strong>ordre d&#39;émission</strong></td>
</tr>
<tr>
<td><code>state</code></td>
<td>string</td>
<td><code>pending</code> | <code>success</code> | <code>failed</code></td>
</tr>
<tr>
<td><code>client_price</code></td>
<td>objet</td>
<td><code>{ amount_minor:int, currency:&quot;XOF&quot;, scale:0 }</code></td>
</tr>
<tr>
<td><code>card</code></td>
<td>objet | <code>null</code></td>
<td><code>B2bCardResource</code> si la carte existe, sinon <code>null</code></td>
</tr>
<tr>
<td><code>cardholder_name</code></td>
<td>string</td>
<td></td>
</tr>
<tr>
<td><code>cardholder_email</code></td>
<td>string | <code>null</code></td>
<td></td>
</tr>
<tr>
<td><code>failure_reason</code></td>
<td>string | <code>null</code></td>
<td>renseigné si <code>state = failed</code></td>
</tr>
<tr>
<td><code>created_at</code></td>
<td>string | <code>null</code></td>
<td>ISO-8601</td>
</tr>
</tbody></table></div>
<p><strong>Erreurs spécifiques</strong> :</p>
<div class="doc-tablewrap"><table>
<thead>
<tr>
<th>Cas</th>
<th>HTTP</th>
<th>code</th>
</tr>
</thead>
<tbody><tr>
<td><code>Idempotency-Key</code> manquant/vide</td>
<td>422</td>
<td><code>idempotency_key_required</code></td>
</tr>
<tr>
<td><code>Idempotency-Key</code> invalide (regex)</td>
<td>422</td>
<td><code>idempotency_key_invalid</code></td>
</tr>
<tr>
<td>BIN non résolu</td>
<td>422</td>
<td><code>bin_required</code></td>
</tr>
<tr>
<td><code>bin_uuid</code> pointant un BIN désactivé</td>
<td>422</td>
<td>rejet <strong>validation</strong> Laravel (§6.4), clé <code>bin_uuid</code> — <strong>pas</strong> <code>bin_not_issuable</code></td>
</tr>
<tr>
<td>BIN désactivé entre validation et émission (course)</td>
<td>422</td>
<td><code>bin_not_issuable</code> (garde-fou défensif, rare)</td>
</tr>
<tr>
<td>Solde wallet insuffisant</td>
<td>422</td>
<td><code>insufficient_balance</code></td>
</tr>
<tr>
<td>Même <code>Idempotency-Key</code>, corps différent</td>
<td>409</td>
<td><code>idempotency_key_conflict</code></td>
</tr>
<tr>
<td>Validation de champ (<code>cardholder_name</code>, etc.)</td>
<td>422</td>
<td>format Laravel par défaut (voir §6)</td>
</tr>
</tbody></table></div>
<p>Sources : <code>B2bCardController.php:34-46</code>, <code>BinNotIssuableException.php:9-17</code>,
<code>bootstrap/app.php:110-114, 128-132, 134-138</code>, <code>IdempotencyConflictException.php</code>.</p>
<h3 id="5-2-get-api-b2b-cards-uuid-consultation-d-39-une-carte">5.2 <code>GET /api/b2b/cards/{uuid}</code> — Consultation d&#39;une carte<a class="doc-anchor" href="#5-2-get-api-b2b-cards-uuid-consultation-d-39-une-carte" aria-label="Lien vers cette section">#</a></h3>
<p><strong>En-têtes</strong> : 4 en-têtes HMAC uniquement. Aucun corps.</p>
<p><strong>Réponse de succès</strong> : <strong>HTTP 200</strong>, <code>message = null</code>, <code>data = B2bCardResource</code>.
Source : <code>B2bCardController.php:64-68</code>.</p>
<pre><code class="language-json">{
  &quot;message&quot;: null,
  &quot;data&quot;: {
    &quot;uuid&quot;: &quot;c9a8b7d6-1234-4e5f-8a9b-abcdef012345&quot;,
    &quot;status&quot;: &quot;active&quot;,
    &quot;pan_last4&quot;: &quot;4242&quot;,
    &quot;expiry_month&quot;: 12,
    &quot;expiry_year&quot;: 2028,
    &quot;cardholder_name&quot;: &quot;Awa Diop&quot;,
    &quot;cardholder_email&quot;: &quot;awa@example.com&quot;,
    &quot;currency&quot;: &quot;USD&quot;,
    &quot;created_at&quot;: &quot;2026-08-15T10:22:31+00:00&quot;
  },
  &quot;errors&quot;: null
}
</code></pre>
<p>Champs de <code>data</code> — <code>B2bCardResource.php:19-32</code> :</p>
<div class="doc-tablewrap"><table>
<thead>
<tr>
<th>Champ</th>
<th>Type</th>
<th>Notes</th>
</tr>
</thead>
<tbody><tr>
<td><code>uuid</code></td>
<td>string</td>
<td>UUID de la <strong>carte</strong></td>
</tr>
<tr>
<td><code>status</code></td>
<td>string</td>
<td><code>pending</code> | <code>active</code> | <code>frozen</code> | <code>cancelled</code></td>
</tr>
<tr>
<td><code>pan_last4</code></td>
<td>string | <code>null</code></td>
<td>4 derniers chiffres</td>
</tr>
<tr>
<td><code>expiry_month</code></td>
<td>int | <code>null</code></td>
<td>valeur brute du modèle</td>
</tr>
<tr>
<td><code>expiry_year</code></td>
<td>int | <code>null</code></td>
<td>valeur brute du modèle</td>
</tr>
<tr>
<td><code>cardholder_name</code></td>
<td>string | <code>null</code></td>
<td></td>
</tr>
<tr>
<td><code>cardholder_email</code></td>
<td>string | <code>null</code></td>
<td></td>
</tr>
<tr>
<td><code>currency</code></td>
<td>string</td>
<td><code>USD</code> (ou <code>XOF</code>)</td>
</tr>
<tr>
<td><code>created_at</code></td>
<td>string | <code>null</code></td>
<td>ISO-8601</td>
</tr>
</tbody></table></div>
<blockquote>
<p><strong>Réserve</strong> : les types PHP exacts de <code>pan_last4</code>, <code>expiry_month</code>, <code>expiry_year</code> ne
sont pas re-vérifiés au niveau des casts du modèle <code>Card</code> (hors périmètre) ; la
ressource expose les attributs bruts tels quels.</p>
</blockquote>
<p><strong>Erreurs spécifiques</strong> :</p>
<div class="doc-tablewrap"><table>
<thead>
<tr>
<th>Cas</th>
<th>HTTP</th>
<th>Notes</th>
</tr>
</thead>
<tbody><tr>
<td>Carte inexistante</td>
<td>404</td>
<td>format Laravel par défaut (§6)</td>
</tr>
<tr>
<td>Carte appartenant à un autre marchand</td>
<td>404</td>
<td><code>abort(404)</code> — même forme</td>
</tr>
</tbody></table></div>
<p>Source : <code>B2bCardController.php:110-120</code>.</p>
<h3 id="5-3-post-api-b2b-cards-uuid-reveal-revelation-pan-cvv">5.3 <code>POST /api/b2b/cards/{uuid}/reveal</code> — Révélation PAN/CVV<a class="doc-anchor" href="#5-3-post-api-b2b-cards-uuid-reveal-revelation-pan-cvv" aria-label="Lien vers cette section">#</a></h3>
<p><strong>En-têtes</strong> : 4 en-têtes HMAC uniquement (pas d&#39;<code>Idempotency-Key</code>). Aucun corps.</p>
<p><strong>Prérequis</strong> : votre compte doit avoir <code>can_reveal_pan = true</code> (activé par FixPay via
un workflow d&#39;approbation). Sinon → <code>403 pan_reveal_not_allowed</code>. Source :
<code>B2bCardController.php:76-78</code>, <code>PanRevealNotAllowedException.php:9-17</code>.</p>
<p><strong>Réponse de succès</strong> : <strong>HTTP 200</strong>, <code>message = &quot;b2b_card_revealed&quot;</code>, avec les
en-têtes de réponse <strong><code>Cache-Control: no-store, max-age=0</code></strong> et <strong><code>Pragma: no-cache</code></strong>.
Source : <code>B2bCardController.php:82-92</code>.</p>
<pre><code class="language-json">{
  &quot;message&quot;: &quot;b2b_card_revealed&quot;,
  &quot;data&quot;: {
    &quot;pan&quot;: &quot;4242424242424242&quot;,
    &quot;cvv&quot;: &quot;123&quot;,
    &quot;expiry&quot;: &quot;12/28&quot;,
    &quot;cardholder_name&quot;: &quot;Awa Diop&quot;
  },
  &quot;errors&quot;: null
}
</code></pre>
<p>Champs de <code>data</code> — <code>B2bCardController.php:83-88</code>, <code>CardRevealResult.php:9-18</code> :</p>
<div class="doc-tablewrap"><table>
<thead>
<tr>
<th>Champ</th>
<th>Type</th>
<th>Notes</th>
</tr>
</thead>
<tbody><tr>
<td><code>pan</code></td>
<td>string</td>
<td>numéro de carte complet</td>
</tr>
<tr>
<td><code>cvv</code></td>
<td>string</td>
<td></td>
</tr>
<tr>
<td><code>expiry</code></td>
<td>string | <code>null</code></td>
<td>format <strong><code>&quot;MM/YY&quot;</code></strong> quand <code>expiry_month</code> et <code>expiry_year</code> existent (ex. mois 9 / 2027 → <code>&quot;09/27&quot;</code>)</td>
</tr>
<tr>
<td><code>cardholder_name</code></td>
<td>string | <code>null</code></td>
<td></td>
</tr>
</tbody></table></div>
<blockquote>
<p><strong>Ambiguïté <code>expiry</code></strong> : si <code>expiry_month</code>/<code>expiry_year</code> sont absents, la valeur
retombe sur <code>details-&gt;expiryDate</code> fourni par le fournisseur VCC, dont le format
<strong>n&#39;est pas vérifié dans le code lu</strong>. La valeur peut être <code>null</code>. Source :
<code>RevealCard.php:49-57</code>.</p>
</blockquote>
<p><strong>Erreurs spécifiques</strong> :</p>
<div class="doc-tablewrap"><table>
<thead>
<tr>
<th>Cas</th>
<th>HTTP</th>
<th>code</th>
</tr>
</thead>
<tbody><tr>
<td>Révélation PAN désactivée pour le marchand</td>
<td>403</td>
<td><code>pan_reveal_not_allowed</code></td>
</tr>
<tr>
<td>Carte annulée / sans identifiant VCC / détails fournisseur absents</td>
<td>422</td>
<td><code>card_not_actionable</code></td>
</tr>
<tr>
<td>Carte inexistante / non possédée</td>
<td>404</td>
<td>format Laravel par défaut (§6)</td>
</tr>
</tbody></table></div>
<p>Sources : <code>PanRevealNotAllowedException.php:9-17</code>, <code>CardNotActionableException.php:9-17</code>,
<code>RevealCard.php:25-32</code>, <code>B2bCardController.php:110-120</code>.</p>
<h3 id="5-4-cycle-de-vie-d-39-une-carte-freeze-unfreeze-cancel">5.4 Cycle de vie d&#39;une carte (<code>freeze</code> / <code>unfreeze</code> / <code>cancel</code>)<a class="doc-anchor" href="#5-4-cycle-de-vie-d-39-une-carte-freeze-unfreeze-cancel" aria-label="Lien vers cette section">#</a></h3>
<p>Trois endpoints pilotent le cycle de vie d&#39;une carte déjà émise :</p>
<div class="doc-tablewrap"><table>
<thead>
<tr>
<th>Méthode + chemin</th>
<th>Effet</th>
<th><code>message</code> succès</th>
</tr>
</thead>
<tbody><tr>
<td><code>POST /api/b2b/cards/{uuid}/freeze</code></td>
<td>Gèle la carte (statut → <code>frozen</code>)</td>
<td><code>b2b_card_frozen</code></td>
</tr>
<tr>
<td><code>POST /api/b2b/cards/{uuid}/unfreeze</code></td>
<td>Réactive la carte (statut → <code>active</code>)</td>
<td><code>b2b_card_unfrozen</code></td>
</tr>
<tr>
<td><code>POST /api/b2b/cards/{uuid}/cancel</code></td>
<td>Annule définitivement la carte (statut → <code>cancelled</code>)</td>
<td><code>b2b_card_cancelled</code></td>
</tr>
</tbody></table></div>
<p><strong>En-têtes</strong> : les <strong>4 en-têtes HMAC uniquement</strong> (§4.1). <strong>Pas</strong> d&#39;<code>Idempotency-Key</code>
(le cycle de vie est déjà idempotent, voir plus bas). <strong>Aucun corps</strong> de requête (le
hash du corps vide <code>e3b0c442...b855</code> entre dans la signature, comme pour <code>reveal</code>).</p>
<p><strong>Réponse de succès</strong> : <strong>HTTP 200</strong>, <code>data = B2bCardResource</code> de la carte <strong>mise à
jour</strong> (même forme qu&#39;au §5.2), <code>message</code> selon le tableau ci-dessus. Source :
<code>B2bCardController.php:101-120</code>.</p>
<pre><code class="language-json">{
  &quot;message&quot;: &quot;b2b_card_frozen&quot;,
  &quot;data&quot;: {
    &quot;uuid&quot;: &quot;c9a8b7d6-1234-4e5f-8a9b-abcdef012345&quot;,
    &quot;status&quot;: &quot;frozen&quot;,
    &quot;pan_last4&quot;: &quot;4242&quot;,
    &quot;expiry_month&quot;: 12,
    &quot;expiry_year&quot;: 2028,
    &quot;cardholder_name&quot;: &quot;Awa Diop&quot;,
    &quot;cardholder_email&quot;: &quot;awa@example.com&quot;,
    &quot;currency&quot;: &quot;USD&quot;,
    &quot;created_at&quot;: &quot;2026-08-15T10:22:31+00:00&quot;
  },
  &quot;errors&quot;: null
}
</code></pre>
<p><strong>Idempotence.</strong> Chaque opération est <strong>idempotente</strong> : rejouer une transition vers un
statut <strong>déjà atteint</strong> ne provoque <strong>aucune erreur</strong> et renvoie <strong>200</strong> avec la carte
inchangée (no-op). Ainsi <code>freeze</code> sur une carte déjà <code>frozen</code>, <code>unfreeze</code> sur une carte
déjà <code>active</code>, ou <code>cancel</code> sur une carte déjà <code>cancelled</code> renvoient <code>200</code>.</p>
<p><strong>Pas de suppression dure.</strong> Il n&#39;existe <strong>aucune suppression physique</strong> d&#39;une carte :
annuler = passage au statut <code>cancelled</code> (principe d&#39;<strong>immuabilité</strong>). La ressource reste
consultable via <code>GET /cards/{uuid}</code> avec <code>status = cancelled</code>. Une carte <code>cancelled</code> est
un état terminal : elle ne peut plus être ni gelée, ni réactivée.</p>
<p><strong>Erreurs spécifiques</strong> :</p>
<div class="doc-tablewrap"><table>
<thead>
<tr>
<th>Cas</th>
<th>HTTP</th>
<th>code</th>
</tr>
</thead>
<tbody><tr>
<td><code>freeze</code> d&#39;une carte non <code>active</code> (ou sans identifiant fournisseur VCC)</td>
<td>422</td>
<td><code>card_not_actionable</code></td>
</tr>
<tr>
<td><code>unfreeze</code> d&#39;une carte non <code>frozen</code> (ou sans identifiant fournisseur VCC)</td>
<td>422</td>
<td><code>card_not_actionable</code></td>
</tr>
<tr>
<td><code>cancel</code> d&#39;une carte sans identifiant fournisseur VCC</td>
<td>422</td>
<td><code>card_not_actionable</code></td>
</tr>
<tr>
<td><code>cancel</code> d&#39;une carte au solde <strong>&gt; 0</strong></td>
<td>422</td>
<td><code>card_has_balance</code></td>
</tr>
<tr>
<td>Carte inexistante / non possédée</td>
<td>404</td>
<td>format Laravel par défaut (§6)</td>
</tr>
</tbody></table></div>
<p>Pour annuler une carte au solde positif, <strong>videz-la d&#39;abord</strong> (le solde carte doit être
nul), puis rappelez <code>cancel</code>. Sources : <code>CardNotActionableException.php:9-17</code>,
<code>CardHasBalanceException.php:9-17</code>, <code>SuspendCard.php</code>, <code>EnableCard.php</code>, <code>CancelCard.php</code>,
<code>B2bCardController.php:101-120</code>.</p>
<hr>
<h2 id="6-enveloppe-de-reponse-amp-catalogue-d-39-erreurs">6. Enveloppe de réponse &amp; catalogue d&#39;erreurs<a class="doc-anchor" href="#6-enveloppe-de-reponse-amp-catalogue-d-39-erreurs" aria-label="Lien vers cette section">#</a></h2>
<h3 id="6-1-enveloppe-standard-apiresponse">6.1 Enveloppe standard (<code>ApiResponse</code>)<a class="doc-anchor" href="#6-1-enveloppe-standard-apiresponse" aria-label="Lien vers cette section">#</a></h3>
<p>Toutes les réponses <strong>de succès</strong> et <strong>les erreurs applicatives mappées</strong> ont
exactement <strong>trois clés de premier niveau</strong> : <code>message</code>, <code>data</code>, <code>errors</code>. Il n&#39;y a
<strong>pas</strong> de clé <code>meta</code>, ni de clé <code>code</code> au premier niveau. Source :
<code>ApiResponse.php:14-37</code>.</p>
<p><strong>Succès</strong> — <code>errors</code> toujours <code>null</code> :</p>
<pre><code class="language-json">{ &quot;message&quot;: &lt;string|null&gt;, &quot;data&quot;: &lt;object|null&gt;, &quot;errors&quot;: null }
</code></pre>
<p><strong>Erreur applicative</strong> — <code>data</code> toujours <code>null</code>, <code>errors</code> contient <code>{ &quot;code&quot;: &quot;...&quot; }</code> :</p>
<pre><code class="language-json">{ &quot;message&quot;: &quot;&lt;code&gt;&quot;, &quot;data&quot;: null, &quot;errors&quot;: { &quot;code&quot;: &quot;&lt;code&gt;&quot; } }
</code></pre>
<blockquote>
<p>Note : en erreur applicative, le champ <code>message</code> <strong>est le code machine</strong> (ex.
<code>&quot;unauthorized&quot;</code>), identique à <code>errors.code</code>. Ce n&#39;est pas un message humain.</p>
</blockquote>
<h3 id="6-2-deux-familles-d-39-erreurs-divergence-reelle-du-code">6.2 Deux familles d&#39;erreurs (divergence réelle du code)<a class="doc-anchor" href="#6-2-deux-familles-d-39-erreurs-divergence-reelle-du-code" aria-label="Lien vers cette section">#</a></h3>
<ul>
<li><strong>Famille A — via <code>ApiResponse</code></strong> : respecte l&#39;enveloppe <code>{message, data, errors}</code>
avec <code>errors.code</code>. Couvre l&#39;auth HMAC et les erreurs métier des endpoints.</li>
<li><strong>Famille B — rendue par Laravel par défaut</strong> : <strong>n&#39;utilise pas</strong> l&#39;enveloppe.
Couvre la <strong>validation 422</strong>, le <strong>404</strong>, le <strong>429</strong>. Forme JSON différente,
<strong>définie par le framework, pas par le code projet</strong> — ne présumez pas d&#39;un
<code>errors.code</code> pour ces cas.</li>
</ul>
<p>Pour garantir un rendu JSON de la Famille B, envoyez <code>Accept: application/json</code>.</p>
<h3 id="6-3-catalogue-famille-a-enveloppe-apiresponse">6.3 Catalogue — Famille A (enveloppe <code>ApiResponse</code>)<a class="doc-anchor" href="#6-3-catalogue-famille-a-enveloppe-apiresponse" aria-label="Lien vers cette section">#</a></h3>
<div class="doc-tablewrap"><table>
<thead>
<tr>
<th><code>code</code></th>
<th>HTTP</th>
<th>Cause</th>
<th>Source</th>
</tr>
</thead>
<tbody><tr>
<td><code>unauthorized</code></td>
<td>401</td>
<td>En-tête d&#39;auth manquant ; clé inconnue / non <code>active</code> / expirée ; marchand inactif ; <strong>signature invalide</strong> ; <strong>timestamp hors fenêtre</strong></td>
<td><code>VerifyB2bHmac.php:125-128</code></td>
</tr>
<tr>
<td><code>replay_detected</code></td>
<td>409</td>
<td>Nonce déjà utilisé pour cette clé</td>
<td><code>VerifyB2bHmac.php:130-133</code></td>
</tr>
<tr>
<td><code>idempotency_key_required</code></td>
<td>422</td>
<td><code>POST /cards</code> sans <code>Idempotency-Key</code></td>
<td><code>B2bCardController.php:34-36</code></td>
</tr>
<tr>
<td><code>idempotency_key_invalid</code></td>
<td>422</td>
<td><code>Idempotency-Key</code> hors regex</td>
<td><code>B2bCardController.php:38-40</code></td>
</tr>
<tr>
<td><code>idempotency_key_conflict</code></td>
<td>409</td>
<td>Même clé réutilisée avec un corps/chemin/méthode différent</td>
<td><code>IdempotencyConflictException</code>, <code>bootstrap/app.php:128-132</code></td>
</tr>
<tr>
<td><code>bin_required</code></td>
<td>422</td>
<td>Aucun BIN résolu (ni <code>bin_uuid</code>, ni défaut valide)</td>
<td><code>B2bCardController.php:44-46</code></td>
</tr>
<tr>
<td><code>bin_not_issuable</code></td>
<td>422</td>
<td>BIN résolu mais non <code>fixpay_enabled</code></td>
<td><code>BinNotIssuableException.php:9-17</code>, <code>bootstrap/app.php:110-114</code></td>
</tr>
<tr>
<td><code>insufficient_balance</code></td>
<td>422</td>
<td>Wallet marchand insuffisant</td>
<td><code>bootstrap/app.php:134-138</code></td>
</tr>
<tr>
<td><code>pan_reveal_not_allowed</code></td>
<td>403</td>
<td><code>reveal</code> alors que <code>can_reveal_pan = false</code></td>
<td><code>PanRevealNotAllowedException.php:9-17</code>, <code>bootstrap/app.php:116-120</code></td>
</tr>
<tr>
<td><code>card_not_actionable</code></td>
<td>422</td>
<td>Carte annulée / sans identifiant VCC / détails absents ; transition de cycle de vie illégale (<code>freeze</code> d&#39;une carte non <code>active</code>, <code>unfreeze</code> d&#39;une carte non <code>frozen</code>, <code>cancel</code> sans identifiant VCC)</td>
<td><code>CardNotActionableException.php:9-17</code></td>
</tr>
<tr>
<td><code>card_has_balance</code></td>
<td>422</td>
<td><code>cancel</code> d&#39;une carte dont le solde est <strong>&gt; 0</strong> (videz la carte d&#39;abord)</td>
<td><code>CardHasBalanceException.php:9-17</code></td>
</tr>
</tbody></table></div>
<blockquote>
<p><strong>Le middleware HMAC fusionne toutes les causes d&#39;échec d&#39;authentification en un seul
<code>unauthorized</code> / 401</strong> (en-tête manquant, clé inconnue, signature invalide, timestamp
expiré…). La réponse <strong>ne distingue jamais</strong> la cause précise. C&#39;est intentionnel
dans le code. Seul le <strong>rejeu de nonce</strong> sort en <code>409 replay_detected</code>.</p>
</blockquote>
<blockquote>
<p><strong>Réserve</strong> : lors de l&#39;émission, l&#39;appel synchrone au fournisseur VCC peut lever
d&#39;autres sous-classes de <code>CardException</code> que <code>bin_not_issuable</code>. Elles surfaceraient
avec la même forme (<code>message = code</code>, <code>errors.code</code>, statut propre), mais <strong>elles ne
sont pas énumérées dans le code lu</strong>. À ne pas présumer.</p>
</blockquote>
<p>Exemples :</p>
<pre><code class="language-json">{ &quot;message&quot;: &quot;unauthorized&quot;, &quot;data&quot;: null, &quot;errors&quot;: { &quot;code&quot;: &quot;unauthorized&quot; } }
</code></pre>
<pre><code class="language-json">{ &quot;message&quot;: &quot;replay_detected&quot;, &quot;data&quot;: null, &quot;errors&quot;: { &quot;code&quot;: &quot;replay_detected&quot; } }
</code></pre>
<pre><code class="language-json">{ &quot;message&quot;: &quot;insufficient_balance&quot;, &quot;data&quot;: null, &quot;errors&quot;: { &quot;code&quot;: &quot;insufficient_balance&quot; } }
</code></pre>
<h3 id="6-4-famille-b-erreurs-laravel-par-defaut">6.4 Famille B — erreurs Laravel par défaut<a class="doc-anchor" href="#6-4-famille-b-erreurs-laravel-par-defaut" aria-label="Lien vers cette section">#</a></h3>
<p>Ces réponses <strong>n&#39;ont pas</strong> l&#39;enveloppe <code>ApiResponse</code>. Leur forme provient du framework
et <strong>n&#39;est pas définie dans le code projet</strong> (les chaînes de message ci-dessous sont
illustratives, générées par Laravel).</p>
<p><strong>Validation 422</strong> (échec de <code>IssueB2bCardRequest</code>) — forme <code>{message, errors}</code>,
<strong>sans</strong> <code>data</code>, <strong>sans</strong> <code>code</code> :</p>
<pre><code class="language-json">{
  &quot;message&quot;: &quot;The cardholder name field is required.&quot;,
  &quot;errors&quot;: {
    &quot;cardholder_name&quot;: [&quot;The cardholder name field is required.&quot;],
    &quot;bin_uuid&quot;: [&quot;The selected bin uuid is invalid.&quot;]
  }
}
</code></pre>
<p><strong>404 not found</strong> (carte inexistante ou non possédée) — forme <code>{message}</code> seule :</p>
<pre><code class="language-json">{ &quot;message&quot;: &quot;...&quot; }
</code></pre>
<p><strong>429 rate limit</strong> (dépassement du throttle) — forme <code>{message}</code> (typiquement
<code>&quot;Too Many Attempts.&quot;</code>) + en-têtes <code>Retry-After</code> / <code>X-RateLimit-*</code> fournis par le
framework :</p>
<pre><code class="language-json">{ &quot;message&quot;: &quot;Too Many Attempts.&quot; }
</code></pre>
<p>Source : <code>bootstrap/app.php:73-145</code> (aucun <code>render()</code> custom pour ces cas),
<code>IssueB2bCardRequest.php:20-31</code>, <code>routes/api.php:52</code>.</p>
<hr>
<h2 id="7-idempotence-post-cards">7. Idempotence (<code>POST /cards</code>)<a class="doc-anchor" href="#7-idempotence-post-cards" aria-label="Lien vers cette section">#</a></h2>
<ul>
<li>En-tête <strong><code>Idempotency-Key</code></strong> obligatoire sur l&#39;émission uniquement.</li>
<li>Format : <strong><code>^[A-Za-z0-9_.:-]{1,128}$</code></strong> (lettres, chiffres, <code>_</code>, <code>.</code>, <code>:</code>, <code>-</code>, de 1
à 128 caractères). Source : <code>B2bCardController.php:133-136</code>.</li>
<li>L&#39;idempotence est scopée par marchand (espace <code>b2b_issue:&lt;merchant_id&gt;</code>). Source :
<code>InitiateB2bCardIssuance.php:60-66</code>.</li>
<li><strong>Réutilisation à l&#39;identique</strong> (même clé, même corps) : la requête est rejouée et
renvoie le <strong>même ordre</strong> — vous pouvez re-tenter sans risque de double émission.</li>
<li><strong>Conflit</strong> : même clé mais <strong>corps / chemin / méthode différents</strong> → <code>409 idempotency_key_conflict</code>. L&#39;empreinte comparée est
<code>sha256(méthode + &quot;\\n&quot; + path + &quot;\\n&quot; + sha256(corps brut))</code>. Source :
<code>B2bCardController.php:138-145</code> (empreinte), <code>Idempotency.php:55-64</code> (comparaison).</li>
</ul>
<p>Recommandation : générez une clé stable par intention d&#39;émission (ex. votre identifiant
de commande interne), et rejouez-la telle quelle en cas de time-out réseau.</p>
<hr>
<h2 id="8-limites-de-debit">8. Limites de débit<a class="doc-anchor" href="#8-limites-de-debit" aria-label="Lien vers cette section">#</a></h2>
<ul>
<li>Le groupe B2B applique <code>throttle:b2b</code>. Source : <code>routes/api.php:52</code>.</li>
<li><strong>Quota par défaut : 120 requêtes / minute</strong>, pilotable côté FixPay via
<code>B2B_THROTTLE_PER_MINUTE</code>. Source : <code>AppServiceProvider.php:221-229</code>,
<code>config/b2b.php:10</code>.</li>
<li><strong>Clé de comptage</strong> : par <strong>clé publique</strong> présentée (<code>b2b-key:&lt;publicKey&gt;</code>) si
l&#39;en-tête <code>X-FixPay-Key</code> est renseigné ; sinon par <strong>IP</strong> (<code>b2b-ip:&lt;ip&gt;</code>). Source :
<code>AppServiceProvider.php:223-228</code>.</li>
<li>Nuance : le comptage utilise la <strong>valeur brute</strong> de l&#39;en-tête clé, sans vérifier sa
validité — le quota est décompté même pour une clé ensuite rejetée en 401.</li>
<li>Dépassement → <strong>HTTP 429</strong> (Famille B, §6.4), avec en-têtes <code>Retry-After</code> /
<code>X-RateLimit-*</code>.</li>
</ul>
<hr>
<h2 id="9-webhooks-implemente-et-actif">9. Webhooks (implémenté et actif)<a class="doc-anchor" href="#9-webhooks-implemente-et-actif" aria-label="Lien vers cette section">#</a></h2>
<p>FixPay pousse des webhooks <strong>serveur-à-serveur</strong> vers votre URL lorsque le cycle
d&#39;émission d&#39;une carte se termine. Ce mécanisme est <strong>implémenté et actif</strong> (outbox,
livraison planifiée, signature HMAC, retries, dead-letter). Source :
<code>OutboxWriter.php</code>, <code>DeliverB2bWebhooks.php</code>, migrations <code>b2b_webhook_deliveries</code> /
<code>outbox</code>.</p>
<h3 id="9-1-enregistrement-de-l-39-url">9.1 Enregistrement de l&#39;URL<a class="doc-anchor" href="#9-1-enregistrement-de-l-39-url" aria-label="Lien vers cette section">#</a></h3>
<p>Vous <strong>n&#39;enregistrez pas</strong> votre URL vous-même : l&#39;<strong>admin FixPay</strong> fixe le
<code>webhook_url</code> (HTTPS public obligatoire) <strong>à la création de votre compte</strong>. Source :
<code>CreateMerchant.php:31</code>, <code>CreateMerchantRequest.php:27</code>, <code>PublicHttpsUrl.php</code>.</p>
<blockquote>
<p><strong>Limite du code actuel</strong> : il n&#39;existe <strong>aucun endpoint de mise à jour du
<code>webhook_url</code></strong> après création (ni self-service, ni admin). Pour le changer, adressez-
vous à FixPay. Source : <code>routes/api.php:100-110</code> (pas de méthode <code>update</code>).</p>
</blockquote>
<h3 id="9-2-types-d-39-evenements-liste-exhaustive-2">9.2 Types d&#39;événements (liste exhaustive : 2)<a class="doc-anchor" href="#9-2-types-d-39-evenements-liste-exhaustive-2" aria-label="Lien vers cette section">#</a></h3>
<p>Enum <code>OutboxEventType.php:9-10</code> — <strong>seuls ces deux types existent</strong> :</p>
<ul>
<li><code>card.issued</code> — carte émise avec succès.</li>
<li><code>card.issue_failed</code> — échec de l&#39;émission.</li>
</ul>
<p>Aucun autre événement de cycle de vie n&#39;est émis (pas de <code>card.activated</code>,
<code>card.frozen</code>, <code>card.reveal</code>, etc.). Aucun événement de test/ping n&#39;est implémenté.
<code>GET /cards</code> et <code>reveal</code> n&#39;émettent aucun webhook.</p>
<h3 id="9-3-forme-du-payload">9.3 Forme du payload<a class="doc-anchor" href="#9-3-forme-du-payload" aria-label="Lien vers cette section">#</a></h3>
<p>Corps encodé avec <code>JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE</code>. Source :
<code>DeliverB2bWebhooks.php:274-282</code>.</p>
<pre><code class="language-json">{
  &quot;event_id&quot;: &quot;&lt;uuid de l&#39;événement&gt;&quot;,
  &quot;event_type&quot;: &quot;card.issued&quot;,
  &quot;occurred_at&quot;: &quot;&lt;ISO-8601 | null&gt;&quot;,
  &quot;data&quot;: { ... }
}
</code></pre>
<p><code>data</code> pour <strong><code>card.issued</code></strong> (<code>ConfirmCardIssuance.php:100-107</code>) :
<code>order_uuid</code>, <code>card_uuid</code>, <code>pan_last4</code>, <code>status</code>, <code>currency</code>, <code>cardholder_name</code>.</p>
<p><code>data</code> pour <strong><code>card.issue_failed</code></strong> (<code>CompensateCardIssuance.php:64-67</code>) :
<code>order_uuid</code>, <code>failure_reason</code>.</p>
<h3 id="9-4-en-tetes-de-livraison">9.4 En-têtes de livraison<a class="doc-anchor" href="#9-4-en-tetes-de-livraison" aria-label="Lien vers cette section">#</a></h3>
<p>Source : <code>DeliverB2bWebhooks.php:287-296</code>, <code>config/b2b.php:24-27</code>.</p>
<div class="doc-tablewrap"><table>
<thead>
<tr>
<th>En-tête</th>
<th>Valeur</th>
</tr>
</thead>
<tbody><tr>
<td><code>X-FixPay-Signature</code></td>
<td><code>sha256=&lt;hmac_hex&gt;</code> (voir §9.5)</td>
</tr>
<tr>
<td><code>X-FixPay-Timestamp</code></td>
<td>timestamp Unix (secondes, string) — <strong>informatif, non signé</strong></td>
</tr>
<tr>
<td><code>X-FixPay-Event-Id</code></td>
<td>UUID de l&#39;événement (= <code>event_id</code> du corps)</td>
</tr>
<tr>
<td><code>X-FixPay-Event-Type</code></td>
<td><code>card.issued</code> | <code>card.issue_failed</code></td>
</tr>
<tr>
<td><code>Idempotency-Key</code></td>
<td>même UUID que <code>X-FixPay-Event-Id</code> (déduplication)</td>
</tr>
<tr>
<td><code>Content-Type</code></td>
<td><code>application/json</code></td>
</tr>
</tbody></table></div>
<h3 id="9-5-verification-de-la-signature-webhook-entrant">9.5 Vérification de la signature (webhook entrant)<a class="doc-anchor" href="#9-5-verification-de-la-signature-webhook-entrant" aria-label="Lien vers cette section">#</a></h3>
<blockquote>
<p><strong>Attention — sémantique DIFFÉRENTE de l&#39;auth des requêtes sortantes du §4.</strong> Le
webhook signe <strong>le corps brut SEUL</strong> (pas de méthode/URI/timestamp/nonce), utilise un
<strong>secret dédié</strong> (<code>webhook_secret</code>), et le préfixe <code>sha256=</code> <strong>fait partie</strong> de la
valeur d&#39;en-tête. Le nom d&#39;en-tête <code>X-FixPay-Signature</code> est identique, mais la
formule ne l&#39;est pas.</p>
</blockquote>
<p>Formule exacte (<code>DeliverB2bWebhooks.php:121-123</code>, <code>HmacVerifier.php:27-30</code>) :</p>
<pre><code>X-FixPay-Signature = &quot;sha256=&quot; + hex( HMAC_SHA256( corps_brut, webhook_secret ) )
</code></pre>
<p>Algorithme de vérification côté marchand :</p>
<ol>
<li>Lire le <strong>corps HTTP brut</strong> reçu (ne pas re-sérialiser).</li>
<li>Calculer <code>expected = &quot;sha256=&quot; + hex(HMAC_SHA256(rawBody, webhook_secret))</code>.</li>
<li>Comparer à l&#39;en-tête <code>X-FixPay-Signature</code> en <strong>temps constant</strong>.</li>
<li>(Optionnel) dédupliquer via <code>X-FixPay-Event-Id</code> / <code>Idempotency-Key</code>.</li>
</ol>
<blockquote>
<p>Le <code>X-FixPay-Timestamp</code> du webhook <strong>n&#39;entre pas dans la signature</strong> ; il ne peut
donc pas servir de preuve cryptographique anti-rejeu. Utilisez <code>X-FixPay-Event-Id</code>
pour la déduplication.</p>
</blockquote>
<p>Exemple (Node.js) :</p>
<pre><code class="language-js">const crypto = require(&quot;crypto&quot;);

function verify(rawBody, headerSignature, webhookSecret) {
  const expected =
    &quot;sha256=&quot; +
    crypto.createHmac(&quot;sha256&quot;, webhookSecret).update(rawBody).digest(&quot;hex&quot;);
  const a = Buffer.from(expected);
  const b = Buffer.from(headerSignature || &quot;&quot;);
  return a.length === b.length &amp;&amp; crypto.timingSafeEqual(a, b);
}
</code></pre>
<h3 id="9-6-livraison-retries-backoff">9.6 Livraison, retries, backoff<a class="doc-anchor" href="#9-6-livraison-retries-backoff" aria-label="Lien vers cette section">#</a></h3>
<p>Source : <code>DeliverB2bWebhooks.php</code>, <code>config/b2b.php:19-28</code>, <code>config/scheduler.php:50</code>.</p>
<ul>
<li>Livraison <strong><code>POST</code></strong> sur votre <code>webhook_url</code>, <code>Content-Type: application/json</code>,
timeout par défaut <strong>10 s</strong>, sans suivre les redirections, résolution DNS épinglée
(anti-SSRF).</li>
<li><strong>Non synchrone</strong> : la livraison dépend d&#39;un scheduler cadencé à ~60 s (latence
nominale jusqu&#39;à ~1 minute après l&#39;événement).</li>
<li><strong>Succès</strong> = réponse <strong>HTTP 2xx</strong>.</li>
<li><strong>Tentatives</strong> : <code>max_attempts</code> par défaut <strong>6</strong>.</li>
<li><strong>Backoff</strong> (secondes) : <code>[60, 300, 900, 3600, 10800]</code> ; au-delà, la dernière valeur
(3 h) est réutilisée.</li>
<li>Échec définitif après <code>max_attempts</code> → <strong>dead-letter</strong> (alerte interne FixPay).</li>
<li>Chaque tentative est tracée côté FixPay (statut HTTP, extrait de réponse ≤ 500
caractères, erreur, prochaine tentative).</li>
</ul>
<p><strong>Recommandations d&#39;intégration</strong> : répondez rapidement en <strong>2xx</strong> ; traitez de façon
<strong>idempotente</strong> via <code>X-FixPay-Event-Id</code> ; attendez-vous à des re-livraisons du même
événement.</p>
</article></div>`;

export default function DocsPage() {
  return (
    <div className="doc-page">
      <header className="doc-topbar">
        <span className="doc-brand">
          FixPay <span>· Documentation API</span>
        </span>
        <a className="doc-back" href="https://fixpay.me">
          Retour au site
        </a>
      </header>
      <div dangerouslySetInnerHTML={{ __html: DOC_HTML }} />
    </div>
  );
}
