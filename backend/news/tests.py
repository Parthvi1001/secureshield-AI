from django.test import TestCase

from news.management.commands.scrape_news import infer_category


class NewsCategoryInferenceTests(TestCase):
	def test_infers_malware_category(self):
		self.assertEqual(
			infer_category("New ransomware campaign targets enterprises", "https://example.com/ransomware-campaign"),
			"Malware",
		)

	def test_infers_phishing_category(self):
		self.assertEqual(
			infer_category("Credential theft via phishing emails", "https://example.com/phishing-email"),
			"Phishing",
		)

	def test_infers_data_breach_category(self):
		self.assertEqual(
			infer_category("Customer data breach exposes records", "https://example.com/data-breach"),
			"Data Breach",
		)

	def test_infers_cyber_attack_category(self):
		self.assertEqual(
			infer_category("DDoS attack disrupts services", "https://example.com/ddos-attack"),
			"Cyber Attack",
		)

	def test_falls_back_to_general(self):
		self.assertEqual(
			infer_category("Security update released", "https://example.com/security-update"),
			"General",
		)
