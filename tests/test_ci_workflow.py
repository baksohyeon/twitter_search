import unittest
import yaml
import os

class TestCIWorkflow(unittest.TestCase):
    """
    Test suite for validating the CI workflow YAML configuration.
    Using unittest framework (Python built-in) to validate GitHub Actions workflow structure,
    syntax, and critical configuration values.
    """

    @classmethod
    def setUpClass(cls):
        """Load the CI workflow file once for all tests."""
        cls.workflow_path = '.github/workflows/ci.yaml'
        
        if os.path.exists(cls.workflow_path):
            with open(cls.workflow_path, 'r', encoding='utf-8') as f:
                cls.workflow_content = f.read()
        else:
            # Fallback content based on the provided source code
            cls.workflow_content = """name: CI

on:
  schedule:
    - cron: '40 6 * * *'
  push:
    branches:
      - "main"
  pull_request:
    branches:
      - "main"

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 22

      - name: Install node modules
        working-directory: ./twitter-search-modern/
        run: npm ci

      - name: Build static site
        working-directory: ./twitter-search-modern/
        run: npm run build


  lint:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 22

      - name: Install node modules
        working-directory: ./twitter-search-modern/
        run: npm install

      - name: Run lint
        working-directory: ./twitter-search-modern/
        run: npm run lint
"""

    def setUp(self):
        """Parse YAML content before each test."""
        try:
            self.workflow = yaml.safe_load(self.workflow_content)
        except yaml.YAMLError as e:
            self.fail(f"Failed to parse YAML: {e}")

    def test_yaml_syntax_is_valid(self):
        """Test that the workflow YAML has valid syntax."""
        try:
            parsed = yaml.safe_load(self.workflow_content)
            self.assertIsInstance(parsed, dict, "YAML should parse to a dictionary")
        except yaml.YAMLError as e:
            self.fail(f"Invalid YAML syntax: {e}")

    def test_workflow_has_required_top_level_keys(self):
        """Test that workflow contains required top-level keys."""
        required_keys = ['name', 'on', 'jobs']
        for key in required_keys:
            with self.subTest(key=key):
                self.assertIn(key, self.workflow, f"Missing required key: {key}")

    def test_workflow_name_is_defined(self):
        """Test that workflow has a meaningful name."""
        self.assertEqual(self.workflow['name'], 'CI')
        self.assertIsInstance(self.workflow['name'], str)
        self.assertGreater(len(self.workflow['name'].strip()), 0)

    def test_trigger_events_are_configured(self):
        """Test that appropriate trigger events are configured."""
        triggers = self.workflow['on']
        self.assertIsInstance(triggers, dict, "Triggers should be a dictionary")

        # Test push trigger
        self.assertIn('push', triggers, "Should have push trigger")
        self.assertIn('branches', triggers['push'], "Push should specify branches")
        self.assertIn('main', triggers['push']['branches'], "Should trigger on main branch")

        # Test pull request trigger
        self.assertIn('pull_request', triggers, "Should have pull_request trigger")
        self.assertIn('branches', triggers['pull_request'], "PR should specify branches")
        self.assertIn('main', triggers['pull_request']['branches'], "Should trigger on main branch PRs")

        # Test schedule trigger
        self.assertIn('schedule', triggers, "Should have schedule trigger")
        self.assertIsInstance(triggers['schedule'], list, "Schedule should be a list")
        self.assertGreater(len(triggers['schedule']), 0, "Should have at least one schedule")

    def test_cron_schedule_format(self):
        """Test that cron schedule has valid format."""
        schedule = self.workflow['on']['schedule'][0]
        self.assertIn('cron', schedule, "Schedule should have cron expression")
        cron_expr = schedule['cron']

        # Basic cron format validation (5 fields: minute hour day month weekday)
        cron_parts = cron_expr.split()
        self.assertEqual(len(cron_parts), 5, "Cron expression should have 5 fields")

        # Test specific expected value (6:40 AM daily)
        self.assertEqual(cron_expr, '40 6 * * *', "Cron should run at 6:40 AM daily")

        # Validate cron field formats
        minute, hour, day, month, weekday = cron_parts
        self.assertTrue(minute.isdigit() and 0 <= int(minute) <= 59, "Invalid minute")
        self.assertTrue(hour.isdigit() and 0 <= int(hour) <= 23, "Invalid hour")

    def test_jobs_are_defined(self):
        """Test that jobs are properly defined."""
        jobs = self.workflow['jobs']
        self.assertIsInstance(jobs, dict, "Jobs should be a dictionary")
        self.assertGreater(len(jobs), 0, "At least one job should be defined")

        # Test specific jobs exist
        expected_jobs = ['build', 'lint']
        for job_name in expected_jobs:
            with self.subTest(job=job_name):
                self.assertIn(job_name, jobs, f"Job '{job_name}' should be defined")

    def test_build_job_configuration(self):
        """Test build job configuration thoroughly."""
        build_job = self.workflow['jobs']['build']

        # Test runner
        self.assertEqual(build_job['runs-on'], 'ubuntu-latest', "Build should run on ubuntu-latest")

        # Test steps exist and are valid
        self.assertIn('steps', build_job, "Build job should have steps")
        steps = build_job['steps']
        self.assertIsInstance(steps, list, "Steps should be a list")
        self.assertGreaterEqual(len(steps), 4, "Build should have at least 4 steps")

        # Test checkout step
        checkout_step = steps[0]
        self.assertEqual(checkout_step['name'], 'Checkout repository')
        self.assertEqual(checkout_step['uses'], 'actions/checkout@v4')

        # Test Node.js setup step
        node_step = steps[1]
        self.assertEqual(node_step['uses'], 'actions/setup-node@v4')
        self.assertIn('with', node_step, "Node setup should have 'with' configuration")
        self.assertEqual(node_step['with']['node-version'], 22)

        # Test install step
        install_step = next(
            (step for step in steps if step.get('name') == 'Install node modules'),
            None
        )
        self.assertIsNotNone(install_step, "Build should have install step")
        self.assertEqual(install_step['run'], 'npm ci')
        self.assertEqual(install_step['working-directory'], './twitter-search-modern/')

        # Test build step
        build_step = next(
            (step for step in steps if step.get('name') == 'Build static site'),
            None
        )
        self.assertIsNotNone(build_step, "Build should have build step")
        self.assertEqual(build_step['run'], 'npm run build')
        self.assertEqual(build_step['working-directory'], './twitter-search-modern/')

    def test_lint_job_configuration(self):
        """Test lint job configuration thoroughly."""
        lint_job = self.workflow['jobs']['lint']

        # Test runner
        self.assertEqual(lint_job['runs-on'], 'ubuntu-latest', "Lint should run on ubuntu-latest")

        # Test steps exist and are valid
        self.assertIn('steps', lint_job, "Lint job should have steps")
        steps = lint_job['steps']
        self.assertIsInstance(steps, list, "Steps should be a list")
        self.assertGreaterEqual(len(steps), 4, "Lint should have at least 4 steps")

        # Test that lint job has the expected steps
        step_names = [step.get('name', '') for step in steps]
        expected_steps = ['Checkout repository', 'Install node modules', 'Run lint']

        for expected_step in expected_steps:
            with self.subTest(step=expected_step):
                self.assertIn(expected_step, step_names, f"Missing step: {expected_step}")

        # Test lint step specifically
        lint_step = next(
            (step for step in steps if step.get('name') == 'Run lint'),
            None
        )
        self.assertIsNotNone(lint_step, "Should have lint step")
        self.assertEqual(lint_step['run'], 'npm run lint')
        self.assertEqual(lint_step['working-directory'], './twitter-search-modern/')

    def test_working_directory_consistency(self):
        """Test that working directories are consistent across jobs."""
        expected_working_dir = './twitter-search-modern/'

        for job_name, job_config in self.workflow['jobs'].items():
            steps = job_config.get('steps', [])

            for step in steps:
                if 'working-directory' in step:
                    with self.subTest(job=job_name, step=step.get('name', 'unnamed')):
                        self.assertEqual(
                            step['working-directory'],
                            expected_working_dir,
                            f"Inconsistent working directory in {job_name}"
                        )

    def test_node_version_consistency(self):
        """Test that Node.js version is consistent across jobs."""
        expected_node_version = 22

        for job_name, job_config in self.workflow['jobs'].items():
            steps = job_config.get('steps', [])

            for step in steps:
                if step.get('uses') == 'actions/setup-node@v4':
                    with self.subTest(job=job_name):
                        self.assertIn('with', step, f"Node setup in {job_name} should have 'with'")
                        self.assertEqual(
                            step['with']['node-version'],
                            expected_node_version,
                            f"Inconsistent Node.js version in {job_name}"
                        )

    def test_npm_commands_are_appropriate(self):
        """Test that npm commands are appropriate for their context."""
        build_job = self.workflow['jobs']['build']
        lint_job = self.workflow['jobs']['lint']

        # Build job should use npm ci for reproducible builds
        build_install_step = next(
            (step for step in build_job['steps'] if 'Install node modules' in step.get('name', '')),
            None
        )
        self.assertIsNotNone(build_install_step, "Build job should have install step")
        self.assertEqual(build_install_step['run'], 'npm ci', "Build should use npm ci for reproducibility")

        # Lint job uses npm install (note: could be npm ci for consistency)
        lint_install_step = next(
            (step for step in lint_job['steps'] if 'Install node modules' in step.get('name', '')),
            None
        )
        self.assertIsNotNone(lint_install_step, "Lint job should have install step")
        self.assertEqual(lint_install_step['run'], 'npm install', "Lint uses npm install")

    def test_action_versions_are_pinned(self):
        """Test that GitHub Actions are pinned to specific versions."""
        for job_name, job_config in self.workflow['jobs'].items():
            steps = job_config.get('steps', [])

            for step in steps:
                if 'uses' in step:
                    action = step['uses']
                    with self.subTest(job=job_name, action=action):
                        self.assertIn('@', action, f"Action {action} should be pinned to a version")
                        # Verify specific expected versions
                        if action.startswith('actions/checkout'):
                            self.assertEqual(action, 'actions/checkout@v4')
                        elif action.startswith('actions/setup-node'):
                            self.assertEqual(action, 'actions/setup-node@v4')

    def test_job_names_are_descriptive(self):
        """Test that job names are descriptive and follow conventions."""
        jobs = self.workflow['jobs']

        for job_name in jobs:
            with self.subTest(job=job_name):
                # Job names should be lowercase and descriptive
                self.assertTrue(job_name.islower(), f"Job name '{job_name}' should be lowercase")
                self.assertGreater(len(job_name), 2, f"Job name '{job_name}' should be descriptive")
                # Should not contain spaces or special characters
                self.assertRegex(job_name, r'^[a-z0-9_-]+$', f"Job name '{job_name}' should use valid characters")

    def test_step_names_are_descriptive(self):
        """Test that step names are descriptive and consistent."""
        for job_name, job_config in self.workflow['jobs'].items():
            steps = job_config.get('steps', [])

            for i, step in enumerate(steps):
                with self.subTest(job=job_name, step_index=i):
                    if 'name' in step:
                        name = step['name']
                        self.assertGreater(len(name.strip()), 0, "Step name should not be empty")
                        self.assertTrue(name[0].isupper(), f"Step name '{name}' should start with uppercase")
                        # Should be descriptive
                        self.assertGreater(len(name.split()), 1, f"Step name '{name}' should be descriptive")

    def test_workflow_structure_completeness(self):
        """Test that the workflow structure is complete and logical."""
        # Test that build job has all necessary steps in logical order
        build_steps = self.workflow['jobs']['build']['steps']
        build_step_names = [step.get('name', step.get('uses', '')) for step in build_steps]

        # Should have checkout, setup, install, build steps
        self.assertIn('Checkout repository', build_step_names)
        self.assertTrue(any('setup-node' in name for name in build_step_names))
        self.assertIn('Install node modules', build_step_names)
        self.assertIn('Build static site', build_step_names)

        # Test order: checkout should come first
        checkout_index = next(i for i, name in enumerate(build_step_names) if 'Checkout' in name)
        self.assertEqual(checkout_index, 0, "Checkout should be first step")

        # Test that lint job has all necessary steps
        lint_steps = self.workflow['jobs']['lint']['steps']
        lint_step_names = [step.get('name', step.get('uses', '')) for step in lint_steps]

        self.assertIn('Checkout repository', lint_step_names)
        self.assertTrue(any('setup-node' in name for name in lint_step_names))
        self.assertIn('Install node modules', lint_step_names)
        self.assertIn('Run lint', lint_step_names)

    def test_no_sensitive_data_exposure(self):
        """Test that no sensitive data is exposed in the workflow."""
        workflow_str = self.workflow_content.lower()

        # Common sensitive data patterns
        sensitive_patterns = [
            'password', 'secret', 'token', 'api_key',
            'private_key', 'credential'
        ]

        for pattern in sensitive_patterns:
            with self.subTest(pattern=pattern):
                if pattern in workflow_str:
                    # Make sure it's not a hardcoded value
                    lines_with_pattern = [
                        line for line in workflow_str.split('\n') 
                        if pattern in line and ':' in line
                    ]
                    for line in lines_with_pattern:
                        # Check for potential hardcoded secrets (basic detection)
                        self.assertNotRegex(
                            line, 
                            rf'{pattern}\s*:\s*["\']?[a-zA-Z0-9]{{8,}}["\']?',
                            f"Potential hardcoded {pattern} found: {line.strip()}"
                        )

    def test_workflow_has_no_duplicate_steps(self):
        """Test that jobs don't have duplicate steps."""
        for job_name, job_config in self.workflow['jobs'].items():
            steps = job_config.get('steps', [])
            step_names = [step.get('name', '') for step in steps if step.get('name')]

            with self.subTest(job=job_name):
                # Check for duplicate step names
                self.assertEqual(len(step_names), len(set(step_names)),
                               f"Job {job_name} has duplicate step names")

    def test_runner_os_is_supported(self):
        """Test that runner OS is a supported GitHub Actions runner."""
        supported_runners = [
            'ubuntu-latest', 'ubuntu-22.04', 'ubuntu-20.04',
            'windows-latest', 'windows-2022', 'windows-2019',
            'macos-latest', 'macos-12', 'macos-11'
        ]

        for job_name, job_config in self.workflow['jobs'].items():
            with self.subTest(job=job_name):
                runner = job_config.get('runs-on')
                self.assertIsNotNone(runner, f"Job {job_name} should specify runs-on")
                self.assertIn(runner, supported_runners, 
                            f"Job {job_name} uses unsupported runner: {runner}")

    def test_workflow_triggers_branch_protection(self):
        """Test that workflow triggers are configured for branch protection."""
        # Both push and PR triggers should target main branch
        push_branches = self.workflow['on']['push']['branches']
        pr_branches = self.workflow['on']['pull_request']['branches']

        self.assertEqual(push_branches, ['main'], "Push should only trigger on main")
        self.assertEqual(pr_branches, ['main'], "PR should only trigger on main")

    def test_node_version_is_lts_or_current(self):
        """Test that Node.js version is LTS or current stable."""
        # Node.js 22 is a current stable version
        expected_version = 22

        for job_name, job_config in self.workflow['jobs'].items():
            steps = job_config.get('steps', [])

            for step in steps:
                if step.get('uses') == 'actions/setup-node@v4':
                    with self.subTest(job=job_name):
                        version = step['with']['node-version']
                        self.assertGreaterEqual(version, 18, 
                                              f"Node.js version {version} should be >= 18 (LTS)")
                        self.assertEqual(version, expected_version,
                                       f"Expected Node.js version {expected_version}")

class TestCIWorkflowIntegration(unittest.TestCase):
    """
    Integration tests for CI workflow that verify file existence and structure.
    """

    def test_workflow_file_exists(self):
        """Test that the CI workflow file exists in the correct location."""
        workflow_path = '.github/workflows/ci.yaml'
        self.assertTrue(os.path.exists(workflow_path), 
                       f"CI workflow file should exist at {workflow_path}")

    def test_workflow_file_is_readable(self):
        """Test that the workflow file is readable and not empty."""
        workflow_path = '.github/workflows/ci.yaml'
        if os.path.exists(workflow_path):
            with open(workflow_path, 'r', encoding='utf-8') as f:
                content = f.read()
                self.assertGreater(len(content.strip()), 0, 
                                 "Workflow file should not be empty")

    def test_project_structure_matches_workflow(self):
        """Test that project structure matches workflow expectations."""
        # Check if twitter-search-modern directory exists
        project_dir = './twitter-search-modern/'
        self.assertTrue(os.path.exists(project_dir), 
                       f"Project directory {project_dir} should exist")
        
        # Check if package.json exists
        package_json = os.path.join(project_dir, 'package.json')
        if os.path.exists(package_json):
            import json
            with open(package_json, 'r') as f:
                package_data = json.load(f)
                
            # Check if required scripts exist
            scripts = package_data.get('scripts', {})
            self.assertIn('build', scripts, "package.json should have build script")
            self.assertIn('lint', scripts, "package.json should have lint script")

if __name__ == '__main__':
    # Create a test suite combining both test classes
    loader = unittest.TestLoader()
    suite = unittest.TestSuite()
    
    # Add all tests from both classes
    suite.addTests(loader.loadTestsFromTestCase(TestCIWorkflow))
    suite.addTests(loader.loadTestsFromTestCase(TestCIWorkflowIntegration))
    
    # Run the tests
    runner = unittest.TextTestRunner(verbosity=2)
    runner.run(suite)