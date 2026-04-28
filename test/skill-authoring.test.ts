import assert from "node:assert/strict";
import test from "node:test";

import {
  canSessionEditSkill,
  getSkillPublisherName,
} from "@/lib/skill-authoring";

test("canSessionEditSkill allows the verified attached author", () => {
  const allowed = canSessionEditSkill(
    {
      authorId: "author-loop",
      creatorClerkUserId: undefined,
    },
    {
      displayName: null,
      email: "kk23907751@gmail.com",
      imageUrl: null,
      stripeConnectAccountId: null,
      userId: "user_123",
    },
    {
      badgeLabel: "Verified",
      bio: "",
      displayName: "Loop",
      id: "author-loop",
      isOfficial: true,
      slug: "loop",
      verified: true,
    }
  );

  assert.equal(allowed, true);
});

test("canSessionEditSkill falls back to the legacy creator id", () => {
  const allowed = canSessionEditSkill(
    {
      authorId: undefined,
      creatorClerkUserId: "user_legacy",
    },
    {
      displayName: null,
      email: "someone@example.com",
      imageUrl: null,
      stripeConnectAccountId: null,
      userId: "user_legacy",
    },
    null
  );

  assert.equal(allowed, true);
});

test("getSkillPublisherName prefers the attached author profile", () => {
  const name = getSkillPublisherName({
    author: {
      badgeLabel: "Verified",
      bio: "",
      displayName: "Loop",
      id: "author-loop",
      isOfficial: true,
      slug: "loop",
      verified: true,
    },
    ownerName: "Fallback Name",
  });

  assert.equal(name, "Loop");
});
