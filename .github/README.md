# CI/CD Pipeline Documentation

## 🚀 GitHub Actions Workflows

### Main CI Pipeline (`ci.yml`)
**Triggers:** Push/PR to `main` or `develop`

**Features:**
- ✅ **Parallel execution** - Lint, typecheck, and build run concurrently
- ✅ **Test sharding** - Tests split across 4 parallel workers for 4x speed
- ✅ **Smart caching** - npm cache for faster installs
- ✅ **Fast failure** - Lint and typecheck fail fast before expensive test runs
- ✅ **Artifact uploads** - Build artifacts and coverage reports stored

**Jobs:**
1. **Lint** (~2-3 min) - Biome formatting and linting
2. **Typecheck** (~2-3 min) - TypeScript type checking
3. **Test** (~5-6 min) - Jest tests with 4-way sharding
4. **Build** (~4-5 min) - Production build verification

**Total time:** ~8-10 minutes (vs 20+ minutes sequential)

### PR Checks (`pr.yml`)
**Triggers:** Pull request events

**Smart features:**
- ✅ **Changed files detection** - Only runs tests for changed packages
- ✅ **PR validation** - Enforces conventional commits format
- ✅ **Coverage comments** - Posts coverage diff on PRs
- ✅ **Bundle size analysis** - Reports size impact
- ✅ **Automatic summaries** - Visual PR check results

**Conventional commit format:**
- `feat: add new feature`
- `fix(api): resolve bug`
- `docs: update readme`
- `chore: update deps`

### Release Pipeline (`release.yml`)
**Triggers:** 
- Git tags (`v*.*.*`)
- Manual workflow dispatch

**Features:**
- ✅ **Full validation** - All checks before release
- ✅ **Docker build** - Multi-arch (amd64, arm64)
- ✅ **GitHub Container Registry** - Automated image push
- ✅ **Release notes** - Auto-generated changelog
- ✅ **Semantic versioning** - Multiple tag formats

**Usage:**
```bash
# Tag and push
git tag v1.0.0
git push origin v1.0.0

# Or use GitHub UI for manual release
```

### Security Scanning (`codeql.yml`)
**Triggers:**
- Push to `main`
- PRs to `main`
- Weekly schedule (Mondays)

**Features:**
- ✅ **CodeQL analysis** - Automated security scanning
- ✅ **Vulnerability detection** - Finds security issues
- ✅ **Weekly scans** - Proactive monitoring

### Dependency Updates (`dependabot.yml`)
**Features:**
- ✅ **Automated updates** - Weekly dependency updates
- ✅ **Grouped PRs** - Dev and prod deps grouped separately
- ✅ **GitHub Actions updates** - Keeps workflows up-to-date
- ✅ **Smart ignoring** - Manual review for major versions

## 🎯 Performance Optimizations

1. **Test Sharding** - 4x parallel test execution
2. **Concurrency Control** - Cancels outdated runs
3. **Smart Caching** - npm cache for 3x faster installs
4. **Parallel Jobs** - Lint + typecheck run together
5. **Changed File Detection** - Skip unnecessary tests
6. **Fail Fast** - Quick checks before slow ones
7. **Offline Mode** - `npm ci --prefer-offline`

## 📊 Typical Pipeline Times

| Workflow | Sequential | Optimized | Speedup |
|----------|-----------|-----------|---------|
| Main CI | 20-25 min | 8-10 min | **2.5x faster** |
| PR Checks | 15-20 min | 5-8 min | **3x faster** |
| Release | 30-35 min | 12-15 min | **2.5x faster** |

## 🔧 Local Testing

Test workflows locally before pushing:

```bash
# Install act (GitHub Actions local runner)
brew install act

# Run CI workflow locally
act -j lint
act -j test

# Run full CI pipeline
act push
```

## 🛡️ Branch Protection Rules

Recommended settings for `main` branch:

1. **Require status checks:**
   - ✅ `ci-success` (from ci.yml)
   - ✅ `Lint & Format`
   - ✅ `Type Check`
   - ✅ `Test`
   - ✅ `Build`

2. **Require PR reviews:** 1 approval

3. **Require conversation resolution:** Yes

4. **Require linear history:** Yes

## 📈 Monitoring & Insights

- **GitHub Actions tab** - View all workflow runs
- **Insights → Pulse** - Weekly activity summary
- **Security → Dependabot** - Dependency alerts
- **Security → Code scanning** - CodeQL alerts

## 🚨 Troubleshooting

**Slow npm install?**
- Check cache hit rate in workflow logs
- Verify `cache: 'npm'` in setup-node step

**Tests timing out?**
- Increase `timeout-minutes` in test job
- Check for hanging async operations

**Sharding not working?**
- Verify Jest version >= 29
- Check `--shard` flag support

**Docker build fails?**
- Verify Dockerfile exists
- Check GITHUB_TOKEN permissions

## 📚 References

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Jest Sharding](https://jestjs.io/docs/cli#--shard)
- [Docker Buildx](https://docs.docker.com/buildx/working-with-buildx/)
- [Conventional Commits](https://www.conventionalcommits.org/)
