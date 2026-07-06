<template>
  <div class="km-nebula" aria-hidden="true">
    <div class="km-nebula__deep" />
    <div class="km-nebula__cloud km-nebula__cloud--cyan" />
    <div class="km-nebula__cloud km-nebula__cloud--violet" />
    <div class="km-nebula__cloud km-nebula__cloud--teal" />
    <div class="km-nebula__cloud km-nebula__cloud--blue" />
    <div class="km-nebula__cloud km-nebula__cloud--indigo" />
    <div class="km-nebula__cloud km-nebula__cloud--magenta" />
    <div class="km-nebula__cloud km-nebula__cloud--ice" />
    <div class="km-nebula__cloud km-nebula__cloud--wisp-a" />
    <div class="km-nebula__cloud km-nebula__cloud--wisp-b" />
    <div class="km-nebula__cloud km-nebula__cloud--wisp-c" />
    <div class="km-nebula__cloud km-nebula__cloud--wisp-d" />
    <div class="km-nebula__cloud km-nebula__cloud--wisp-e" />
    <div class="km-nebula__cloud km-nebula__cloud--ember" />
    <div class="km-nebula__cloud km-nebula__cloud--jade" />
    <div class="km-nebula__glow" />
    <div class="km-nebula__vignette" />
  </div>
</template>

<style scoped>
.km-nebula {
  position: absolute;
  inset: 0;
  overflow: hidden;
  background: #03060e;
}

.km-nebula__deep {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    155deg,
    #0a0618 0%,
    #060d1a 22%,
    #081424 48%,
    #120a1e 72%,
    #040a14 100%
  );
}

.km-nebula__cloud {
  position: absolute;
  border-radius: 50%;
  filter: blur(58px);
  opacity: 1;
  will-change: transform;
}

.km-nebula__cloud--cyan {
  width: 85%;
  height: 68%;
  top: -16%;
  left: -12%;
  background: radial-gradient(
    ellipse at center,
    rgba(55, 170, 240, 0.62) 0%,
    rgba(35, 105, 190, 0.32) 38%,
    transparent 70%
  );
  animation: km-drift-a 28s ease-in-out infinite alternate;
}

.km-nebula__cloud--violet {
  width: 76%;
  height: 62%;
  top: 8%;
  right: -20%;
  background: radial-gradient(
    ellipse at center,
    rgba(100, 65, 200, 0.55) 0%,
    rgba(60, 40, 145, 0.28) 40%,
    transparent 68%
  );
  animation: km-drift-b 34s ease-in-out infinite alternate;
}

.km-nebula__cloud--teal {
  width: 68%;
  height: 56%;
  bottom: -12%;
  left: 12%;
  background: radial-gradient(
    ellipse at center,
    rgba(45, 165, 195, 0.5) 0%,
    rgba(25, 95, 125, 0.22) 45%,
    transparent 68%
  );
  animation: km-drift-c 24s ease-in-out infinite alternate;
}

.km-nebula__cloud--blue {
  width: 55%;
  height: 45%;
  top: 32%;
  left: 32%;
  background: radial-gradient(
    ellipse at center,
    rgba(60, 105, 215, 0.28) 0%,
    transparent 68%
  );
  animation: km-drift-a 40s ease-in-out infinite alternate-reverse;
}

.km-nebula__cloud--indigo {
  width: 50%;
  height: 44%;
  bottom: 8%;
  right: 5%;
  background: radial-gradient(
    ellipse at center,
    rgba(45, 55, 140, 0.35) 0%,
    rgba(30, 35, 90, 0.12) 50%,
    transparent 72%
  );
  animation: km-drift-b 32s ease-in-out infinite alternate-reverse;
}

.km-nebula__cloud--magenta {
  width: 42%;
  height: 38%;
  top: 5%;
  left: 42%;
  background: radial-gradient(
    ellipse at center,
    rgba(120, 50, 160, 0.28) 0%,
    transparent 65%
  );
  animation: km-drift-c 36s ease-in-out infinite alternate;
}

.km-nebula__cloud--ice {
  width: 38%;
  height: 35%;
  top: 55%;
  right: 28%;
  background: radial-gradient(
    ellipse at center,
    rgba(140, 200, 255, 0.22) 0%,
    transparent 62%
  );
  animation: km-drift-a 22s ease-in-out infinite alternate;
}

.km-nebula__cloud--wisp-a,
.km-nebula__cloud--wisp-b,
.km-nebula__cloud--wisp-c,
.km-nebula__cloud--wisp-d,
.km-nebula__cloud--wisp-e {
  filter: blur(42px);
  opacity: 0.85;
}

.km-nebula__cloud--wisp-a {
  width: 35%;
  height: 28%;
  top: 22%;
  left: 8%;
  background: radial-gradient(ellipse, rgba(70, 130, 200, 0.25) 0%, transparent 70%);
  animation: km-drift-c 18s ease-in-out infinite alternate-reverse;
}

.km-nebula__cloud--wisp-b {
  width: 30%;
  height: 25%;
  bottom: 22%;
  right: 35%;
  background: radial-gradient(ellipse, rgba(100, 70, 180, 0.2) 0%, transparent 70%);
  animation: km-drift-a 26s ease-in-out infinite alternate;
}

.km-nebula__cloud--wisp-c {
  width: 28%;
  height: 22%;
  top: 68%;
  left: 55%;
  background: radial-gradient(ellipse, rgba(50, 160, 190, 0.38) 0%, transparent 70%);
  animation: km-drift-b 20s ease-in-out infinite alternate-reverse;
}

.km-nebula__cloud--wisp-d {
  width: 40%;
  height: 32%;
  top: 45%;
  left: -5%;
  background: radial-gradient(ellipse, rgba(80, 120, 220, 0.35) 0%, transparent 72%);
  animation: km-drift-a 30s ease-in-out infinite alternate;
}

.km-nebula__cloud--wisp-e {
  width: 32%;
  height: 26%;
  bottom: 15%;
  right: 15%;
  background: radial-gradient(ellipse, rgba(130, 80, 200, 0.32) 0%, transparent 70%);
  animation: km-drift-c 26s ease-in-out infinite alternate;
}

.km-nebula__cloud--ember {
  width: 48%;
  height: 42%;
  bottom: -8%;
  left: -6%;
  background: radial-gradient(
    ellipse at center,
    rgba(255, 140, 70, 0.42) 0%,
    rgba(200, 80, 60, 0.18) 42%,
    transparent 68%
  );
  filter: blur(52px);
  animation: km-drift-b 30s ease-in-out infinite alternate-reverse;
}

.km-nebula__cloud--jade {
  width: 40%;
  height: 36%;
  top: 12%;
  right: -4%;
  background: radial-gradient(
    ellipse at center,
    rgba(60, 220, 170, 0.28) 0%,
    rgba(40, 140, 120, 0.12) 45%,
    transparent 70%
  );
  filter: blur(48px);
  animation: km-drift-a 26s ease-in-out infinite alternate;
}

.km-nebula__glow {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 70% 55% at 18% 78%, rgba(255, 130, 70, 0.14) 0%, transparent 55%),
    radial-gradient(ellipse 75% 60% at 82% 22%, rgba(100, 220, 180, 0.1) 0%, transparent 52%),
    radial-gradient(ellipse 90% 70% at 30% 25%, rgba(60, 140, 220, 0.1) 0%, transparent 55%),
    radial-gradient(ellipse 80% 60% at 70% 75%, rgba(140, 80, 220, 0.12) 0%, transparent 50%);
  pointer-events: none;
}

.km-nebula__vignette {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 55% 48% at 50% 50%, rgba(3, 6, 14, 0.72) 0%, transparent 100%),
    radial-gradient(ellipse 95% 90% at 50% 48%, transparent 35%, rgba(2, 5, 12, 0.5) 100%);
  pointer-events: none;
}

@keyframes km-drift-a {
  from { transform: translate(0, 0) scale(1); }
  to { transform: translate(3%, 2%) scale(1.05); }
}

@keyframes km-drift-b {
  from { transform: translate(0, 0) scale(1); }
  to { transform: translate(-2.5%, 3%) scale(1.04); }
}

@keyframes km-drift-c {
  from { transform: translate(0, 0) scale(1); }
  to { transform: translate(2%, -2.5%) scale(1.06); }
}
</style>
