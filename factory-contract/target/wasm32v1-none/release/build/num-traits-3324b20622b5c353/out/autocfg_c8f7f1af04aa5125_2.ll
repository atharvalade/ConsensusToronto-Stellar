; ModuleID = 'autocfg_c8f7f1af04aa5125_2.a03dc5792667d868-cgu.0'
source_filename = "autocfg_c8f7f1af04aa5125_2.a03dc5792667d868-cgu.0"
target datalayout = "e-m:e-p:32:32-p10:8:8-p20:8:8-i64:64-i128:128-n32:64-S128-ni:1:10:20"
target triple = "wasm32-unknown-unknown"

; core::f64::<impl f64>::to_int_unchecked
; Function Attrs: inlinehint nounwind
define dso_local i32 @"_ZN4core3f6421_$LT$impl$u20$f64$GT$16to_int_unchecked17hef3a726d9dc0bd70E"(double %self) unnamed_addr #0 {
start:
; call <f64 as core::convert::num::FloatToInt<i32>>::to_int_unchecked
  %_0 = call i32 @"_ZN65_$LT$f64$u20$as$u20$core..convert..num..FloatToInt$LT$i32$GT$$GT$16to_int_unchecked17h9c20af9db80b5e1aE"(double %self) #3
  ret i32 %_0
}

; <f64 as core::convert::num::FloatToInt<i32>>::to_int_unchecked
; Function Attrs: inlinehint nounwind
define internal i32 @"_ZN65_$LT$f64$u20$as$u20$core..convert..num..FloatToInt$LT$i32$GT$$GT$16to_int_unchecked17h9c20af9db80b5e1aE"(double %self) unnamed_addr #0 {
start:
  %0 = alloca [4 x i8], align 4
  %1 = call i32 @llvm.wasm.trunc.signed.i32.f64(double %self)
  store i32 %1, ptr %0, align 4
  %_0 = load i32, ptr %0, align 4
  ret i32 %_0
}

; autocfg_c8f7f1af04aa5125_2::probe
; Function Attrs: nounwind
define dso_local void @_ZN26autocfg_c8f7f1af04aa5125_25probe17h307d3ff212e7e34dE() unnamed_addr #1 {
start:
; call core::f64::<impl f64>::to_int_unchecked
  %_1 = call i32 @"_ZN4core3f6421_$LT$impl$u20$f64$GT$16to_int_unchecked17hef3a726d9dc0bd70E"(double 1.000000e+00) #3
  ret void
}

; Function Attrs: nounwind memory(none)
declare i32 @llvm.wasm.trunc.signed.i32.f64(double) #2

attributes #0 = { inlinehint nounwind "target-cpu"="mvp" "target-features"="+mutable-globals" }
attributes #1 = { nounwind "target-cpu"="mvp" "target-features"="+mutable-globals" }
attributes #2 = { nounwind memory(none) }
attributes #3 = { nounwind }

!llvm.ident = !{!0}

!0 = !{!"rustc version 1.87.0 (17067e9ac 2025-05-09)"}
