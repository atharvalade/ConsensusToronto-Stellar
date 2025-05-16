; ModuleID = 'autocfg_c8f7f1af04aa5125_5.33d45ab7c2c666dd-cgu.0'
source_filename = "autocfg_c8f7f1af04aa5125_5.33d45ab7c2c666dd-cgu.0"
target datalayout = "e-m:e-p:32:32-p10:8:8-p20:8:8-i64:64-i128:128-n32:64-S128-ni:1:10:20"
target triple = "wasm32-unknown-unknown"

@alloc_e6758488a51c40069ade2309416f0500 = private unnamed_addr constant [6 x i8] c"<anon>", align 1
@alloc_a49be173fdf35812463348c571e52e40 = private unnamed_addr constant <{ ptr, [12 x i8] }> <{ ptr @alloc_e6758488a51c40069ade2309416f0500, [12 x i8] c"\06\00\00\00\02\00\00\00\1F\00\00\00" }>, align 4

; autocfg_c8f7f1af04aa5125_5::probe
; Function Attrs: nounwind
define dso_local void @_ZN26autocfg_c8f7f1af04aa5125_55probe17h03ce3dcdc7be80a0E() unnamed_addr #0 {
start:
  ret void
}

; core::panicking::panic_const::panic_const_div_by_zero
; Function Attrs: cold noinline noreturn nounwind
declare dso_local void @_ZN4core9panicking11panic_const23panic_const_div_by_zero17hbd7d63f2e949cf1cE(ptr align 4) unnamed_addr #1

attributes #0 = { nounwind "target-cpu"="mvp" "target-features"="+mutable-globals" }
attributes #1 = { cold noinline noreturn nounwind "target-cpu"="mvp" "target-features"="+mutable-globals" }

!llvm.ident = !{!0}

!0 = !{!"rustc version 1.87.0 (17067e9ac 2025-05-09)"}
